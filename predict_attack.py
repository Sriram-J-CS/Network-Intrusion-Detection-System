import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model

# -----------------------------
# LOAD MODEL AND PREPROCESSORS
# -----------------------------
model = load_model("ids_lstm_model.h5")
scaler = joblib.load("scaler.pkl")
protocol_encoder = joblib.load("protocol_encoder.pkl")
service_encoder = joblib.load("service_encoder.pkl")
flag_encoder = joblib.load("flag_encoder.pkl")
attack_encoder = joblib.load("attack_encoder.pkl")  # Multi-class attack types

# -----------------------------
# SAMPLE NETWORK TRAFFIC DATA
# -----------------------------
data = {
    'duration': 0,
    'protocol_type': 'tcp',
    'service': 'http',
    'flag': 'SF',
    'src_bytes': 181,
    'dst_bytes': 5450,
    'land': 0,
    'wrong_fragment': 0,
    'urgent': 0,
    'hot': 0,
    'num_failed_logins': 0,
    'logged_in': 1,
    'num_compromised': 0,
    'root_shell': 0,
    'su_attempted': 0,
    'num_root': 0,
    'num_file_creations': 0,
    'num_shells': 0,
    'num_access_files': 0,
    'num_outbound_cmds': 0,
    'is_host_login': 0,
    'is_guest_login': 0,
    'count': 9,
    'srv_count': 9,
    'serror_rate': 0,
    'srv_serror_rate': 0,
    'rerror_rate': 0,
    'srv_rerror_rate': 0,
    'same_srv_rate': 1,
    'diff_srv_rate': 0,
    'srv_diff_host_rate': 0,
    'dst_host_count': 9,
    'dst_host_srv_count': 9,
    'dst_host_same_srv_rate': 1,
    'dst_host_diff_srv_rate': 0,
    'dst_host_same_src_port_rate': 0.11,
    'dst_host_srv_diff_host_rate': 0,
    'dst_host_serror_rate': 0,
    'dst_host_srv_serror_rate': 0,
    'dst_host_rerror_rate': 0,
    'dst_host_srv_rerror_rate': 0
}

df = pd.DataFrame([data])

# -----------------------------
# ENCODE CATEGORICAL FEATURES
# -----------------------------
df["protocol_type"] = protocol_encoder.transform(df["protocol_type"])
df["service"] = service_encoder.transform(df["service"])
df["flag"] = flag_encoder.transform(df["flag"])

# -----------------------------
# SCALE DATA
# -----------------------------
X = scaler.transform(df)

# -----------------------------
# RESHAPE FOR LSTM
# -----------------------------
X = np.reshape(X, (X.shape[0], 1, X.shape[1]))

# -----------------------------
# PREDICT
# -----------------------------
prediction_probs = model.predict(X)  # vector of probabilities
pred_class_index = np.argmax(prediction_probs[0])  # index of max probability
attack_type = attack_encoder.inverse_transform([pred_class_index])[0]  # decode class

# -----------------------------
# DISPLAY RESULTS
# -----------------------------
if attack_type.lower() == "normal":
    print("✅ Normal Traffic")
else:
    print("⚠️ Attack Detected")
    print(f"Type of Attack: {attack_type}")
    print("🛡️ Attack Prevented / Cured")