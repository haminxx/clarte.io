"""
ASL Sign-to-Text Pipeline - Phase 3: Real-Time Inference

WebSocket server + camera + MediaPipe. Broadcasts recognized ASL text to
connected browser clients. Test mode: press T to send "test" until models are trained.
"""

import asyncio
import json
import sys
import threading
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
import websockets

# Reuse normalization from data_collector
from data_collector import normalize_landmarks

WS_PORT = 8765
WINDOW_NAME_INF = "ASL Inference"

_loop_ref: asyncio.AbstractEventLoop | None = None


def run_websocket_server(clients: set, loop: asyncio.AbstractEventLoop) -> None:
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

    print("ASL Inference Server")
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

    clients: set = set()
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    ws_thread = threading.Thread(
        target=lambda: run_websocket_server(clients, loop),
        daemon=True,
    )
    ws_thread.start()

    run_camera_loop(clients, loop)


if __name__ == "__main__":
    main()
