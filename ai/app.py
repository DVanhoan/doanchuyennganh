import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import json

app = Flask(__name__)
CORS(app)


def decode_base64_image(image_base64: str) -> np.ndarray:
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
    img_bytes = base64.b64decode(image_base64)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img


def estimate_head_direction(rgb_img, face_locations_list=None):
    landmarks_list = face_recognition.face_landmarks(rgb_img, face_locations=face_locations_list)
    if not landmarks_list:
        return "unknown"

    lm = landmarks_list[0]
    nose_bridge = np.array(lm["nose_bridge"][-1], dtype=float)  
    nose_tip = np.array(lm["nose_tip"][2], dtype=float)
    left_eye = np.mean(lm["left_eye"], axis=0)
    right_eye = np.mean(lm["right_eye"], axis=0)
    chin = np.array(lm["chin"][8], dtype=float)  

    eye_center = (left_eye + right_eye) / 2
    eye_dist = np.linalg.norm(right_eye - left_eye)

    if eye_dist == 0:
        return "front"

    yaw = (nose_tip[0] - eye_center[0]) / eye_dist * 60

    chin_eye_dist = np.linalg.norm(chin - eye_center)
    if chin_eye_dist == 0:
        return "front"
    pitch = (nose_tip[1] - eye_center[1]) / chin_eye_dist * 60

    print(f"[HEAD] yaw={yaw:.1f}  pitch={pitch:.1f}", flush=True)

    direction = "front"
    if yaw > 18:
        direction = "right"
    elif yaw < -18:
        direction = "left"
    elif pitch > 26:
        direction = "down"
    elif pitch < 20:
        direction = "up"

    print(f"[HEAD] => {direction}", flush=True)
    return direction


@app.route("/extract-embedding", methods=["POST"])
def extract_embedding():
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    try:
        img = decode_base64_image(data["image"])
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    if img is None:
        return jsonify({"error": "Could not decode image"}), 400

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    scale = 0.5
    small = cv2.resize(rgb, (0, 0), fx=scale, fy=scale)

    face_locs = face_recognition.face_locations(small, number_of_times_to_upsample=1)

    if not face_locs:
        face_locs = face_recognition.face_locations(rgb, number_of_times_to_upsample=1)
        if not face_locs:
            return jsonify({
                "embedding": None,
                "direction": "unknown",
                "status": "NO_FACE"
            }), 200
        loc = [face_locs[0]]
    else:
        t, r, b, l = face_locs[0]
        loc = [(int(t / scale), int(r / scale), int(b / scale), int(l / scale))]

    direction = estimate_head_direction(rgb, face_locations_list=loc)

    encodings = face_recognition.face_encodings(rgb, known_face_locations=loc)
    if not encodings:
        return jsonify({
            "embedding": None,
            "direction": direction,
            "status": "NO_ENCODING"
        }), 200

    embedding = encodings[0].tolist()

    return jsonify({
        "embedding": json.dumps(embedding),
        "direction": direction,
        "status": "OK"
    })


@app.route("/compare", methods=["POST"])
def compare():
    data = request.get_json()
    if not data or "image" not in data or "known_embeddings" not in data:
        return jsonify({"error": "Missing fields"}), 400

    try:
        img = decode_base64_image(data["image"])
    except Exception:
        return jsonify({"error": "Invalid image"}), 400

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb)
    if len(encodings) == 0:
        return jsonify({
            "embedding": None,
            "direction": "unknown",
            "status": "NO_FACE"
        }), 200

    unknown_embedding = encodings[0]

    known = [np.array(json.loads(e) if isinstance(e, str) else e) for e in data["known_embeddings"]]
    distances = face_recognition.face_distance(known, unknown_embedding)
    min_distance = float(np.min(distances))

    return jsonify({
        "match": min_distance < 0.5,
        "distance": min_distance,
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
