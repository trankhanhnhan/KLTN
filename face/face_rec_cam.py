from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
from imutils.video import VideoStream
import argparse
import facenet
import imutils
import os
import pickle
import align.detect_face
import numpy as np
import cv2
import collections

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--path', help='Path of the video you want to test on.', default=0)
    args = parser.parse_args()

    # Set parameters
    MINSIZE = 20
    THRESHOLD = [0.6, 0.7, 0.7]
    FACTOR = 0.709
    INPUT_IMAGE_SIZE = 160
    CLASSIFIER_PATH = 'Models/facemodel.pkl'
    VIDEO_PATH = args.path
    FACENET_MODEL_PATH = 'Models/20180402-114759.pb'

    # Load the custom classifier
    with open(CLASSIFIER_PATH, 'rb') as file:
        model, class_names = pickle.load(file)
    print("Custom Classifier, Successfully loaded")

    # Use a TensorFlow graph and session
    tf.compat.v1.disable_eager_execution()  # Enable compatibility mode for TF 1.x
    with tf.Graph().as_default():
        gpu_options = tf.compat.v1.GPUOptions(per_process_gpu_memory_fraction=0.6)
        sess = tf.compat.v1.Session(config=tf.compat.v1.ConfigProto(gpu_options=gpu_options, log_device_placement=False))

        with sess.as_default():
            # Load the model
            print('Loading feature extraction model')
            facenet.load_model(FACENET_MODEL_PATH)

            # Get input and output tensors
            images_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("input:0")
            embeddings = tf.compat.v1.get_default_graph().get_tensor_by_name("embeddings:0")
            phase_train_placeholder = tf.compat.v1.get_default_graph().get_tensor_by_name("phase_train:0")

            # Create MTCNN model for face detection
            pnet, rnet, onet = align.detect_face.create_mtcnn(sess, "src/align")

            # Initialize the person detection counter
            person_detected = collections.Counter()

            # Start the video stream
            cap = VideoStream(src=0).start()
            cv2.namedWindow('Face Recognition', cv2.WINDOW_NORMAL)

            while True:
                frame = cap.read()
                if frame is None:  # Check if frame is read properly
                    print("Failed to read frame from video stream.")
                    break
                
                frame = imutils.resize(frame, width=600)
                frame = cv2.flip(frame, 1)

                # Detect faces
                bounding_boxes, _ = align.detect_face.detect_face(frame, MINSIZE, pnet, rnet, onet, THRESHOLD, FACTOR)
                faces_found = bounding_boxes.shape[0]
                try:
                    if faces_found > 1:
                        cv2.putText(frame, "Only one face allowed", (10, 30), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                    1, (255, 0, 0), thickness=1, lineType=2)
                    elif faces_found > 0:
                        det = bounding_boxes[:, 0:4]
                        for i in range(faces_found):
                            bb = det[i].astype(np.int32)
                            if (bb[3] - bb[1]) / frame.shape[0] > 0.25:  # Check face size relative to frame size
                                cropped = frame[bb[1]:bb[3], bb[0]:bb[2], :]
                                scaled = cv2.resize(cropped, (INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE),
                                                    interpolation=cv2.INTER_CUBIC)
                                scaled = facenet.prewhiten(scaled)
                                scaled_reshape = scaled.reshape(-1, INPUT_IMAGE_SIZE, INPUT_IMAGE_SIZE, 3)
                                feed_dict = {images_placeholder: scaled_reshape, phase_train_placeholder: False}
                                emb_array = sess.run(embeddings, feed_dict=feed_dict)

                                predictions = model.predict_proba(emb_array)
                                best_class_indices = np.argmax(predictions, axis=1)
                                best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
                                best_name = class_names[best_class_indices[0]]

                                print("Name: {}, Probability: {}".format(best_name, best_class_probabilities))

                                # Check the probability and display either the name or "Unknown"
                                if best_class_probabilities > 0.9:
                                    cv2.rectangle(frame, (bb[0], bb[1]), (bb[2], bb[3]), (0, 255, 0), 2)
                                    text_x = bb[0]
                                    text_y = bb[3] + 20

                                    cv2.putText(frame, best_name, (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                1, (255, 255, 255), thickness=1, lineType=2)
                                    cv2.putText(frame, str(round(best_class_probabilities[0], 3)), 
                                                (text_x, text_y + 17), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                1, (255, 255, 255), thickness=1, lineType=2)
                                    person_detected[best_name] += 1
                                else:
                                    # Display "Unknown" if probability is below 0.8
                                    cv2.rectangle(frame, (bb[0], bb[1]), (bb[2], bb[3]), (0, 0, 255), 2)  # Red box for unknown
                                    text_x = bb[0]
                                    text_y = bb[3] + 20
                                    cv2.putText(frame, "Unknown", (text_x, text_y), cv2.FONT_HERSHEY_COMPLEX_SMALL,
                                                1, (255, 255, 255), thickness=1, lineType=2)

                except Exception as e:
                    print(f"Error during face detection or recognition: {e}")

                cv2.imshow('Face Recognition', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            cap.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
