"""
ASL Sign-to-Text Pipeline - Phase 3: Real-Time Inference

Supports two modes:
1. Local camera: python inference.py - uses OpenCV, press T to test
2. Browser camera: python inference.py --browser - receives frames from WebSocket
"""

import argparse
import asyncio
import base64
import json
import os
import sys
import threading
import time
from collections import deque
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
import websockets

# Reuse normalization from data_collector
from data_collector import landmarks_to_feature_vector, normalize_landmarks

try:
    import tensorflow as tf  # type: ignore

    _TF_AVAILABLE = True
except ImportError:
    _TF_AVAILABLE = False

WS_PORT = 8765
WINDOW_NAME_INF = "ASL Inference"

_loop_ref: asyncio.AbstractEventLoop | None = None


def broadcast(clients: set, payload: dict) -> None:
    loop = _loop_ref
    if not loop:
        return
    msg = json.dumps(payload)
    for ws in list(clients):
        try:
            asyncio.run_coroutine_threadsafe(ws.send(msg), loop).result(timeout=1.0)
        except Exception:
            pass


def _load_asl_classifier():
    """Optional Keras model: sequence in, class logits out. See ASL_MODEL_PATH."""
    path = os.environ.get("ASL_MODEL_PATH", "").strip()
    if not path or not os.path.isfile(path):
        return None, []
    if not _TF_AVAILABLE:
        print("ASL_MODEL_PATH is set but tensorflow is not installed. pip install tensorflow")
        return None, []
    try:
        model = tf.keras.models.load_model(path)  # type: ignore[attr-defined]
    except Exception as e:
        print(f"Failed to load ASL_MODEL_PATH={path}: {e}")
        return None, []
    raw = os.environ.get("ASL_LABELS", "").strip()
    labels = [x.strip() for x in raw.split(",") if x.strip()] if raw else []
    print(f"Loaded ASL classifier from {path} (labels={len(labels)}).")
    return model, labels


def run_websocket_server_browser(clients: set, loop: asyncio.AbstractEventLoop) -> None:
    """Browser mode: accept frames from WebSocket, process with MediaPipe."""
    global _loop_ref
    _loop_ref = loop

    seq_len = max(1, int(os.environ.get("ASL_SEQ_LEN", "30")))
    stable_need = max(1, int(os.environ.get("ASL_STABLE_FRAMES", "8")))
    min_interval = float(os.environ.get("ASL_MIN_BROADCAST_SEC", "1.5"))

    model, class_labels = _load_asl_classifier()
    feat_buffer: deque[np.ndarray] = deque(maxlen=seq_len)
    last_sent_mono = 0.0
    streak_label: str | None = None
    streak_count = 0

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
    )

    def try_classify_and_broadcast() -> None:
        nonlocal last_sent_mono, streak_label, streak_count
        if model is None or len(feat_buffer) < seq_len:
            return
        seq = np.stack(list(feat_buffer), axis=0).astype(np.float32)
        batch = np.expand_dims(seq, axis=0)
        try:
            out = model.predict(batch, verbose=0)  # type: ignore[union-attr]
        except Exception as e:
            print(f"ASL model predict error: {e}")
            return
        idx = int(np.argmax(out[0]))
        if class_labels and idx < len(class_labels):
            label = class_labels[idx]
        else:
            label = f"class_{idx}"

        if label == streak_label:
            streak_count += 1
        else:
            streak_label = label
            streak_count = 1

        now = time.monotonic()
        if streak_count < stable_need or (now - last_sent_mono) < min_interval:
            return

        broadcast(clients, {"type": "asl_text", "content": label})
        last_sent_mono = now
        streak_count = 0
        print(f"Broadcast ASL: {label}")

    async def handler(websocket):
        nonlocal streak_label, streak_count
        clients.add(websocket)
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    msg_type = data.get("type")
                    if msg_type == "test":
                        broadcast(clients, {"type": "asl_text", "content": "test"})
                        print("Broadcast: test (from client)")
                    elif msg_type == "frame":
                        b64 = data.get("data")
                        if b64:
                            img_bytes = base64.b64decode(b64)
                            nparr = np.frombuffer(img_bytes, np.uint8)
                            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                            if frame is not None:
                                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                                results = hands.process(rgb)
                                if results.multi_hand_landmarks:
                                    for hand_landmarks in results.multi_hand_landmarks:
                                        h, w = frame.shape[:2]
                                        xy = np.array(
                                            [[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark],
                                            dtype=np.float32,
                                        )
                                        feat = landmarks_to_feature_vector(xy)
                                        feat_buffer.append(feat)
                                        try_classify_and_broadcast()
                                else:
                                    feat_buffer.clear()
                                    streak_label = None
                                    streak_count = 0
                except (json.JSONDecodeError, KeyError, Exception) as e:
                    print(f"Frame processing error: {e}")
        finally:
            clients.discard(websocket)

    async def serve():
        async with websockets.serve(handler, "localhost", WS_PORT, ping_interval=20):
            await asyncio.Future()

    loop.run_until_complete(serve())
    hands.close()


def run_websocket_server_local(clients: set, loop: asyncio.AbstractEventLoop) -> None:
    """Local camera mode: WebSocket for broadcasting only."""
    global _loop_ref
    _loop_ref = loop

    async def handler(websocket):
        clients.add(websocket)
        try:
            await websocket.wait_closed()
        finally:
            clients.discard(websocket)

    async def serve():
        async with websockets.serve(handler, "localhost", WS_PORT, ping_interval=20):
            await asyncio.Future()

    loop.run_until_complete(serve())


def run_camera_loop(clients: set, loop: asyncio.AbstractEventLoop) -> None:
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    mp_styles = mp.solutions.drawing_styles

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
    )

    print("ASL Inference Server (local camera)")
    print("-" * 40)
    print(f"WebSocket: ws://localhost:{WS_PORT}")
    print("Models not loaded - press T to send test message")
    print("Q / Esc - Quit")
    print("-" * 40)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb)

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                mp_draw.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_styles.get_default_hand_landmarks_style(),
                    mp_styles.get_default_hand_connections_style(),
                )
                h, w, _ = frame.shape
                xy = np.array(
                    [[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark],
                    dtype=np.float32,
                )
                _ = normalize_landmarks(xy)

        cv2.putText(
            frame,
            "Press T to test | Q to quit",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2,
        )
        cv2.imshow(WINDOW_NAME_INF, frame)

        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), ord("Q"), 27):
            break
        if key == ord("t") or key == ord("T"):
            broadcast(clients, {"type": "asl_text", "content": "test"})
            print("Sent: test")

    cap.release()
    cv2.destroyAllWindows()
    hands.close()


def main() -> None:
    sys.path.insert(0, str(Path(__file__).resolve().parent))

    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", action="store_true", help="Accept frames from browser instead of local camera")
    args = parser.parse_args()

    clients: set = set()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    if args.browser:
        print("ASL Inference Server (browser camera)")
        print("-" * 40)
        print(f"WebSocket: ws://localhost:{WS_PORT}")
        print("Waiting for browser to connect and send frames...")
        print("Client can send {\"type\": \"test\"} to verify connection")
        print("Optional: ASL_MODEL_PATH + tensorflow + ASL_LABELS for sequence classifier (see .env.example).")
        print("-" * 40)
        run_websocket_server_browser(clients, loop)
    else:
        ws_thread = threading.Thread(
            target=lambda: run_websocket_server_local(clients, loop),
            daemon=True,
        )
        ws_thread.start()
        run_camera_loop(clients, loop)


if __name__ == "__main__":
    main()
