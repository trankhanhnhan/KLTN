from flask import Flask, render_template, Response
import cv2
import requests
import numpy as np
from ultralytics import YOLO

app = Flask(__name__)
model = YOLO('best.pt')  # Tải mô hình

# Kết nối đến camera ESP32
ESP32_IP = "192.168.1.8"

def generate_frames():
    while True:
        try:
            # Fetch the image from the ESP32 camera
            img_resp = requests.get(f'http://{ESP32_IP}/capture')
            img_resp.raise_for_status()

            # Decode the image
            frame = cv2.imdecode(np.frombuffer(img_resp.content, np.uint8), cv2.IMREAD_COLOR)

            # Object detection
            results = model(frame)

            # Draw bounding boxes
            if results:
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
                            elif cls == 1:  # Class for smoke
                                label = f"Smoke: {conf:.2f}"
                                color = (0, 0, 255)  # Red for smoke
                            else:
                                continue  # Skip other classes

                            # Draw rectangle and label
                            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                            cv2.putText(frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            # Encode the frame to JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')
        except requests.exceptions.RequestException as e:
            print(f"Error fetching video stream: {e}")
            break



@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return render_template('cam.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
