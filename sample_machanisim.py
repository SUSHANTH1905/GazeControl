import cv2
import mediapipe as mp
import pyautogui
import time
import numpy as np

# Initialize Mediapipe face mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, max_num_faces=1)

# Initialize webcam
cap = cv2.VideoCapture(0)

# Get screen size
screen_w, screen_h = pyautogui.size()

# --- CONFIGURABLE PARAMETERS ---
SMOOTHING_FACTOR = 5         # Higher = smoother but slower movement
BLINK_THRESHOLD = 0.018      # Eye closure distance threshold
DOUBLE_BLINK_TIME = 0.35     # Seconds between two blinks = double click
LONG_BLINK_TIME = 0.7        # Seconds eye closed = right click
SCROLL_SENSITIVITY = 0.0025  # Eye vertical motion scaling for scroll

# --- INTERNAL STATE ---
last_positions = []
last_blink_time = 0
blink_start = 0
blink_active = False
scroll_baseline = None

def get_landmark_pos(landmark, frame):
    h, w, _ = frame.shape
    return int(landmark.x * w), int(landmark.y * h)

while True:
    ret, frame = cap.read()
    if not ret:
        print("⚠️ Unable to access webcam.")
        break

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    if results.multi_face_landmarks:
        face_landmarks = results.multi_face_landmarks[0]

        # ---- EYE TRACKING ----
        right_eye = [face_landmarks.landmark[i] for i in range(474, 478)]
        eye_center = right_eye[1]

        # Convert to screen coordinates
        screen_x = np.clip(int(eye_center.x * screen_w), 0, screen_w - 1)
        screen_y = np.clip(int(eye_center.y * screen_h), 0, screen_h - 1)

        # Smooth mouse motion
        last_positions.append((screen_x, screen_y))
        if len(last_positions) > SMOOTHING_FACTOR:
            last_positions.pop(0)
        avg_x = int(np.mean([p[0] for p in last_positions]))
        avg_y = int(np.mean([p[1] for p in last_positions]))

        pyautogui.moveTo(avg_x, avg_y, duration=0.05)

        # ---- BLINK DETECTION ----
        left_eye_top = face_landmarks.landmark[159]
        left_eye_bottom = face_landmarks.landmark[145]
        blink_ratio = abs(left_eye_top.y - left_eye_bottom.y)

        current_time = time.time()

        if blink_ratio < BLINK_THRESHOLD and not blink_active:
            blink_active = True
            blink_start = current_time
        elif blink_ratio >= BLINK_THRESHOLD:
            # Eye reopened
            if blink_active:
                blink_duration = current_time - blink_start

                # --- Short blink = single click ---
                if blink_duration < LONG_BLINK_TIME:
                    if current_time - last_blink_time < DOUBLE_BLINK_TIME:
                        pyautogui.doubleClick()
                        print("🖱️ Double Click!")
                        last_blink_time = 0
                    else:
                        pyautogui.click()
                        print("🖱️ Single Click!")
                        last_blink_time = current_time

                # --- Long blink = right click ---
                elif blink_duration >= LONG_BLINK_TIME:
                    pyautogui.rightClick()
                    print("🖱️ Right Click!")

            blink_active = False

        # ---- OPTIONAL: SCROLL CONTROL ----
        if scroll_baseline is None:
            scroll_baseline = eye_center.y
        else:
            scroll_diff = scroll_baseline - eye_center.y
            if abs(scroll_diff) > 0.01:  # minimal noise filter
                pyautogui.scroll(int(scroll_diff / SCROLL_SENSITIVITY))

        # Visualize landmarks for debugging
        for landmark in right_eye:
            x, y = get_landmark_pos(landmark, frame)
            cv2.circle(frame, (x, y), 2, (0, 255, 0), -1)

    cv2.imshow("AI Eye-Controlled Mouse v2", frame)

    if cv2.waitKey(1) & 0xFF == 27:  # ESC to quit
        break

cap.release()
cv2.destroyAllWindows()


