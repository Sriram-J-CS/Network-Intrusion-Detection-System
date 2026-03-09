from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
import os
import logging

# -----------------------------
# Setup
# -----------------------------
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.FileHandler("predictions.log"), logging.StreamHandler()]
)

# -----------------------------
# Load Model and Preprocessors
# -----------------------------
model = load_model("ids_lstm_model.h5")
scaler = joblib.load("scaler.pkl")
protocol_encoder = joblib.load("protocol_encoder.pkl")
service_encoder = joblib.load("service_encoder.pkl")
flag_encoder = joblib.load("flag_encoder.pkl")
attack_encoder = joblib.load("attack_encoder.pkl")  # NEW

EXPECTED_FEATURES = [
    'duration','protocol_type','service','flag','src_bytes','dst_bytes','land',
    'wrong_fragment','urgent','hot','num_failed_logins','logged_in','num_compromised',
    'root_shell','su_attempted','num_root','num_file_creations','num_shells','num_access_files',
    'num_outbound_cmds','is_host_login','is_guest_login','count','srv_count','serror_rate',
    'srv_serror_rate','rerror_rate','srv_rerror_rate','same_srv_rate','diff_srv_rate',
    'srv_diff_host_rate','dst_host_count','dst_host_srv_count','dst_host_same_srv_rate',
    'dst_host_diff_srv_rate','dst_host_same_src_port_rate','dst_host_srv_diff_host_rate',
    'dst_host_serror_rate','dst_host_srv_serror_rate','dst_host_rerror_rate','dst_host_srv_rerror_rate'
]

# -----------------------------
# Routes
# -----------------------------
@app.route("/")
def home():
    return "IDS Multi-class Prediction API is running ✅"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        if isinstance(data, dict):
            data = [data]

        df = pd.DataFrame(data)

        missing_cols = [col for col in EXPECTED_FEATURES if col not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing columns: {missing_cols}"}), 400

        # Encode categorical features
        df["protocol_type"] = protocol_encoder.transform(df["protocol_type"])
        df["service"] = service_encoder.transform(df["service"])
        df["flag"] = flag_encoder.transform(df["flag"])

        # Scale and reshape
        X = scaler.transform(df)
        X = np.reshape(X, (X.shape[0], 1, X.shape[1]))

        # Predict multi-class
        predictions = model.predict(X)

        results = []
        for pred in predictions:
            class_idx = np.argmax(pred)  # index of max probability
            label = attack_encoder.inverse_transform([class_idx])[0]  # decode attack type
            prob = float(pred[class_idx])
            results.append({"prediction": label, "probability": prob})

        logging.info(f"Input: {data} | Predictions: {results}")
        return jsonify({"results": results})

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)