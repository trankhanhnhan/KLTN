from flask import Flask, render_template, Response
import requests

app = Flask(__name__)

ESP32_IP = "192.168.1.29"  # IP của ESP32

def generate():
    while True:
        try:
            img_resp = requests.get(f'http://{ESP32_IP}/capture')
            img_resp.raise_for_status()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + img_resp.content + b'\r\n\r\n')
        except requests.exceptions.RequestException as e:
            print(f"Error fetching video stream: {e}")
            break

@app.route('/')
def index():
    return render_template('cam.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
