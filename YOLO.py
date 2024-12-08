from flask import Flask, send_file, Response
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import torch
import os
import requests
from ultralytics import YOLO
import time
import firebase_admin
from firebase_admin import credentials, db

# Khởi tạo ứng dụng Flask và SocketIO
app = Flask(__name__)
socketio = SocketIO(app)

# Load mô hình YOLO
model = YOLO('best.pt')  # Chuyển mô hình về CPU (hoặc GPU nếu có)
model.to('cpu')

# Địa chỉ IP của ESP32-CAM
ESP32_IP = "192.168.1.15"  # Địa chỉ IP của ESP32-CAM

# Biến toàn cục theo dõi thời gian phát hiện lửa
fire_detected = False
fire_timer = 0  # Thời gian phát hiện lửa liên tục
FIRE_THRESHOLD = 5  # 5 giây liên tục phát hiện lửa

def generate_frames():
    global fire_detected, fire_timer
    while True:
        try:
            # Fetch the image from the ESP32 camera (lấy ảnh từ camera ESP32)
            img_resp = requests.get(f'http://{ESP32_IP}/capture')  # Địa chỉ lấy ảnh từ ESP32
            img_resp.raise_for_status()  # Kiểm tra trạng thái yêu cầu

            # Decode the image into OpenCV format
            frame = cv2.imdecode(np.frombuffer(img_resp.content, np.uint8), cv2.IMREAD_COLOR)

            # Apply object detection on the frame using YOLO
            results = model(frame)

            # Draw bounding boxes if any
            if results:
                fire_detected = False  # Reset fire detected flag

                for result in results:
                    # Ensure the boxes exist
                    if hasattr(result, 'boxes') and result.boxes is not None:
                        boxes = result.boxes.xyxy.cpu().numpy()  # Convert to numpy array
                        confidences = result.boxes.conf.cpu().numpy()  # Get confidences
                        class_ids = result.boxes.cls.cpu().numpy()  # Get class IDs

                        for box, conf, cls in zip(boxes, confidences, class_ids):
                            x1, y1, x2, y2 = box.astype(int)

                            # Draw bounding box
                            if cls == 0:  # Class for fire
                                label = f"Fire: {conf:.2f}"
                                color = (0, 255, 0)  # Green for fire
                                fire_detected = True
                            elif cls == 1:  # Class for smoke
                                label = f"Smoke: {conf:.2f}"
                                color = (0, 0, 255)  # Red for smoke
                            else:
                                continue  # Skip other classes

                            # Draw rectangle and label on the frame
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                # Nếu phát hiện lửa, tăng bộ đếm thời gian
                if fire_detected:
                    fire_timer += 1
                    if fire_timer >= FIRE_THRESHOLD:  # Nếu phát hiện lửa liên tục trong 5 giây
                        fire_alarm_ref.set("ON")  # Bật báo động lửa
                        fire_detection_ref.set("ON")
                else:
                    fire_timer = 0  # Reset bộ đếm khi không phát hiện lửa

        except requests.exceptions.RequestException as e:
            print(f"Error fetching image from ESP32-CAM: {e}")
            continue  # Skip this frame and continue to the next one if there was an error

        # Encode the frame to JPEG
        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        # Yield the frame as part of the multipart response
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return send_file('cam.html')

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == "__main__":
    socketio.start_background_task(generate_frames)
    socketio.run(app, host='0.0.0.0', port=5000)
