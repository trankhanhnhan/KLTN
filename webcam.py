import requests
import numpy as np
import cv2

class Webcam:
    def __init__(self, ip="192.168.1.29"):
        self.url = f"http://{ip}/" 

    def get_frame(self):
        response = requests.get(self.url)
        if response.status_code == 200:
            return response.content
        else:
            raise Exception("Could not get image from webcam")
