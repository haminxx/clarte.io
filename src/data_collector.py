"""
ASL Sign-to-Text Pipeline - Phase 1: Data Collection & Normalization

Opens webcam, draws MediaPipe hand landmarks, normalizes coordinates,
and records sequences per label on key press. Saves normalized data
to NumPy files + manifest for Phase 2 training.
"""

import csv
import os
import sys
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).resolve().parent / "data"
SEQUENCES_DIR = DATA_DIR / "sequences"
MANIFEST_PATH = DATA_DIR / "manifest.csv"
MIN_FRAMES = 5  # Minimum frames to save a sequence
WINDOW_NAME = "ASL Data Collector"

# MediaPipe hand landmark indices
WRIST = 0
MIDDLE_MCP = 9  # Middle finger MCP for scale reference


# ---------------------------------------------------------------------------
# Landmark Normalization (CRITICAL: invariant to camera distance)
# ---------------------------------------------------------------------------
def normalize_landmarks(landmarks_xy: np.ndarray) -> np.ndarray:
    """
    Normalize 21 MediaPipe hand landmarks so the feature vector is invariant
    to camera distance and hand position.

    Uses wrist-relative translation + scale by hand span (wrist to middle MCP)
    so that moving closer/further from the camera does not change the output.

    Args:
        landmarks_xy: Shape (21, 2) or (21, 3) - x, y (and optionally z) per landmark.
                      MediaPipe returns normalized [0,1] x,y in image space.

    Returns:
        np.ndarray of shape (21, 2) - normalized coordinates, flattened to (42,)
        for compatibility with single-frame classifiers.
    """
    arr = np.asarray(landmarks_xy, dtype=np.float64)
    if arr.ndim == 1:
        arr = arr.reshape(-1, 2)
    # Take only x, y (drop z if present)
    xy = arr[:, :2].copy()

    # 1. Translate so wrist (landmark 0) is at origin
    wrist = xy[WRIST]
    xy = xy - wrist

    # 2. Scale by hand span (wrist to middle MCP) to be invariant to distance
    span = np.linalg.norm(xy[MIDDLE_MCP])
    if span > 1e-6:
        xy = xy / span

    return xy.astype(np.float32)


def landmarks_to_feature_vector(landmarks_xy: np.ndarray) -> np.ndarray:
    """Flatten normalized landmarks to (42,) for single-frame classification."""
    norm = normalize_landmarks(landmarks_xy)
    return norm.flatten()


# ---------------------------------------------------------------------------
# MediaPipe + OpenCV pipeline
# ---------------------------------------------------------------------------
def run_collector() -> None:
    mp_hands = mp.solutions.hands
    mp_draw = mp.solutions.drawing_utils
    mp_styles = mp.solutions.drawing_styles

    SEQUENCES_DIR.mkdir(parents=True, exist_ok=True)
    manifest_exists = MANIFEST_PATH.exists()

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        sys.exit(1)

    hands = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
    )

    buffer: list[np.ndarray] = []
    current_label: str | None = None
    recording = False

    # Load existing manifest to get next sequence IDs per label
    label_count: dict[str, int] = {}
    if manifest_exists:
        with open(MANIFEST_PATH, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                lbl = row["label"]
                label_count[lbl] = label_count.get(lbl, 0) + 1

    print("ASL Data Collector")
    print("-" * 40)
    print("R - Start recording (prompts for label)")
    print("S - Stop recording and save")
    print("Q / Esc - Quit")
    print("-" * 40)

    with open(MANIFEST_PATH, "a", newline="", encoding="utf-8") as manifest_file:
        writer = csv.DictWriter(
            manifest_file,
            fieldnames=["filename", "label", "num_frames"],
        )
        if not manifest_exists:
            writer.writeheader()

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)  # Mirror for natural feel
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
                    # Extract xy (MediaPipe gives normalized x,y in [0,1])
                    h, w, _ = frame.shape
                    xy = np.array(
                        [[lm.x * w, lm.y * h] for lm in hand_landmarks.landmark],
                        dtype=np.float32,
                    )
                    if recording and current_label:
                        norm = normalize_landmarks(xy)
                        buffer.append(norm)

            # Overlay status
            status = f"Recording: {current_label} ({len(buffer)} frames)" if recording else "Idle"
            cv2.putText(
                frame,
                status,
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0) if recording else (255, 255, 255),
                2,
            )
            cv2.imshow(WINDOW_NAME, frame)

            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), ord("Q"), 27):
                break
            if key == ord("r") or key == ord("R"):
                if recording:
                    print("Already recording. Press S to stop first.")
                else:
                    label = input("Label (e.g. A, B, help, thank_you): ").strip()
                    if label:
                        current_label = label
                        buffer = []
                        recording = True
                        print(f"Recording '{current_label}'...")
            if key == ord("s") or key == ord("S"):
                if not recording or not current_label:
                    print("Start recording with R first.")
                elif len(buffer) < MIN_FRAMES:
                    print(f"Too few frames ({len(buffer)}). Need at least {MIN_FRAMES}.")
                else:
                    seq_id = label_count.get(current_label, 0) + 1
                    label_count[current_label] = seq_id
                    label_dir = SEQUENCES_DIR / current_label
                    label_dir.mkdir(parents=True, exist_ok=True)
                    filename = f"seq_{seq_id:03d}.npy"
                    filepath = label_dir / filename
                    arr = np.stack(buffer, axis=0)
                    np.save(filepath, arr)
                    writer.writerow({
                        "filename": str(filepath.relative_to(DATA_DIR)),
                        "label": current_label,
                        "num_frames": len(buffer),
                    })
                    manifest_file.flush()
                    print(f"Saved {filepath} ({len(buffer)} frames)")
                    recording = False
                    current_label = None
                    buffer = []

    cap.release()
    cv2.destroyAllWindows()
    hands.close()
    print("Done.")


if __name__ == "__main__":
    run_collector()
