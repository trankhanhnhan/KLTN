from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from scipy import misc
import sys
import os
import argparse
import tensorflow as tf
import numpy as np
import facenet
import align.detect_face
import random
from time import sleep
from PIL import Image
import imageio

def main(args):
    sleep(random.random())
    output_dir = os.path.expanduser(args.output_dir)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Store some git revision info in a text file in the log directory
    src_path, _ = os.path.split(os.path.realpath(__file__))
    facenet.store_revision_info(src_path, output_dir, ' '.join(sys.argv))

    dataset = facenet.get_dataset(args.input_dir)

    print('Creating networks and loading parameters')

    with tf.Graph().as_default():
        sess = tf.compat.v1.Session()
        with sess.as_default():
            pnet, rnet, onet = align.detect_face.create_mtcnn(sess, None)

    # Parameters for face detection
    minsize = 20
    threshold = [0.6, 0.8, 0.92]
    factor = 0.709

    # Add a random key to the filename to allow alignment using multiple processes
    random_key = np.random.randint(0, high=99999)
    bounding_boxes_filename = os.path.join(output_dir, f'bounding_boxes_{random_key:05d}.txt')

    with open(bounding_boxes_filename, "w") as text_file:
        nrof_images_total = 0
        nrof_successfully_aligned = 0

        if args.random_order:
            random.shuffle(dataset)

        for cls in dataset:
            output_class_dir = os.path.join(output_dir, cls.name)
            if not os.path.exists(output_class_dir):
                os.makedirs(output_class_dir)

            if args.random_order:
                random.shuffle(cls.image_paths)

            for image_path in cls.image_paths:
                nrof_images_total += 1
                filename = os.path.splitext(os.path.split(image_path)[1])[0]
                output_filename = os.path.join(output_class_dir, filename + '.png')
                print(f'Processing {image_path}')

                if not os.path.exists(output_filename):
                    try:
                        img = imageio.imread(image_path)
                        if img.ndim < 2:
                            raise ValueError('Image has less than 2 dimensions')

                        # Convert grayscale to RGB
                        if img.ndim == 2:
                            img = facenet.to_rgb(img)

                        img = img[:, :, 0:3]

                        # Detect faces
                        bounding_boxes, _ = align.detect_face.detect_face(
                            img, minsize, pnet, rnet, onet, threshold, factor
                        )

                        nrof_faces = bounding_boxes.shape[0]

                        if nrof_faces > 0:
                            img_size = np.asarray(img.shape)[0:2]
                            det_arr = []

                            if nrof_faces > 1:
                                if args.detect_multiple_faces:
                                    det_arr.extend(bounding_boxes[:, 0:4])
                                else:
                                    bounding_box_size = (
                                        (bounding_boxes[:, 2] - bounding_boxes[:, 0]) *
                                        (bounding_boxes[:, 3] - bounding_boxes[:, 1])
                                    )
                                    img_center = img_size / 2
                                    offsets = np.vstack([
                                        (bounding_boxes[:, 0] + bounding_boxes[:, 2]) / 2 - img_center[1],
                                        (bounding_boxes[:, 1] + bounding_boxes[:, 3]) / 2 - img_center[0]
                                    ])
                                    offset_dist_squared = np.sum(np.power(offsets, 2.0), 0)
                                    index = np.argmax(bounding_box_size - offset_dist_squared * 2.0)
                                    det_arr.append(bounding_boxes[index, 0:4])
                            else:
                                det_arr.append(bounding_boxes[0, 0:4])

                            for i, det in enumerate(det_arr):
                                det = np.squeeze(det)
                                bb = np.zeros(4, dtype=np.int32)
                                bb[0] = np.maximum(det[0] - args.margin / 2, 0)
                                bb[1] = np.maximum(det[1] - args.margin / 2, 0)
                                bb[2] = np.minimum(det[2] + args.margin / 2, img_size[1])
                                bb[3] = np.minimum(det[3] + args.margin / 2, img_size[0])

                                cropped = img[bb[1]:bb[3], bb[0]:bb[2], :]
                                cropped = Image.fromarray(cropped)
                                scaled = cropped.resize((args.image_size, args.image_size), Image.BILINEAR)

                                nrof_successfully_aligned += 1
                                filename_base, file_extension = os.path.splitext(output_filename)
                                if args.detect_multiple_faces:
                                    output_filename_n = f"{filename_base}_{i}{file_extension}"
                                else:
                                    output_filename_n = f"{filename_base}{file_extension}"

                                imageio.imwrite(output_filename_n, scaled)
                                text_file.write(f'{output_filename_n} {bb[0]} {bb[1]} {bb[2]} {bb[3]}\n')

                        else:
                            raise ValueError('No faces detected')

                    except Exception as e:
                        print(f'Error processing {image_path}: {e}')
                        text_file.write(f'{output_filename}\n')

    print(f'Total number of images: {nrof_images_total}')
    print(f'Number of successfully aligned images: {nrof_successfully_aligned}')


def parse_arguments(argv):
    parser = argparse.ArgumentParser()

    parser.add_argument('input_dir', type=str, help='Directory with unaligned images.')
    parser.add_argument('output_dir', type=str, help='Directory with aligned face thumbnails.')
    parser.add_argument('--image_size', type=int, help='Image size (height, width) in pixels.', default=182)
    parser.add_argument('--margin', type=int, help='Margin for the crop around the bounding box (pixels).', default=44)
    parser.add_argument('--random_order', action='store_true', help='Shuffle image order.')
    parser.add_argument('--gpu_memory_fraction', type=float, help='GPU memory fraction to use.', default=1.0)
    parser.add_argument('--detect_multiple_faces', action='store_true', help='Detect and align multiple faces per image.')

    return parser.parse_args(argv)


if __name__ == '__main__':
    main(parse_arguments(sys.argv[1:]))
