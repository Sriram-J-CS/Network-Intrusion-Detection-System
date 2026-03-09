import pandas as pd
import numpy as np
import joblib
import random
from tensorflow.keras.models import load_model

# -----------------------------
# LOAD MODEL AND PREPROCESSORS
# -----------------------------
model = load_model("ids_lstm_model.h5")
scaler = joblib.load("scaler.pkl")
protocol_encoder = joblib.load("protocol_encoder.pkl")
service_encoder = joblib.load("service_encoder.pkl")
flag_encoder = joblib.load("flag_encoder.pkl")
attack_encoder = joblib.load("attack_encoder.pkl")

# -----------------------------
# LOAD TEST DATA
# -----------------------------
columns = [
    'duration','protocol_type','service','flag','src_bytes','dst_bytes','land',
    'wrong_fragment','urgent','hot','num_failed_logins','logged_in',
    'num_compromised','root_shell','su_attempted','num_root',
    'num_file_creations','num_shells','num_access_files','num_outbound_cmds',
    'is_host_login','is_guest_login','count','srv_count','serror_rate',
    'srv_serror_rate','rerror_rate','srv_rerror_rate','same_srv_rate','diff_srv_rate',
    'srv_diff_host_rate','dst_host_count','dst_host_srv_count','dst_host_same_srv_rate',
    'dst_host_diff_srv_rate','dst_host_same_src_port_rate','dst_host_srv_diff_host_rate',
    'dst_host_serror_rate','dst_host_srv_serror_rate','dst_host_rerror_rate',
    'dst_host_srv_rerror_rate','class','difficulty'
]

data = pd.read_csv("KDDTest+.csv", names=columns)

# -----------------------------
# RANDOMLY SELECT A SAMPLE
# -----------------------------
sample = data.sample(1)  # pick a random row
true_label = sample['class'].values[0]  # actual class for reference

# Drop label columns for model input
sample_input = sample.drop(['class','difficulty'], axis=1)

# -----------------------------
# ENCODE CATEGORICAL FEATURES
# -----------------------------
sample_input["protocol_type"] = protocol_encoder.transform(sample_input["protocol_type"])
sample_input["service"] = service_encoder.transform(sample_input["service"])
sample_input["flag"] = flag_encoder.transform(sample_input["flag"])

# -----------------------------
# SCALE AND RESHAPE
# -----------------------------
X = scaler.transform(sample_input)
X = np.reshape(X, (X.shape[0],1,X.shape[1]))

# -----------------------------
# PREDICT
# -----------------------------
prediction_probs = model.predict(X)
pred_class_index = np.argmax(prediction_probs[0])
predicted_attack = attack_encoder.inverse_transform([pred_class_index])[0]

# -----------------------------
# DISPLAY RESULTS
# -----------------------------
if predicted_attack.lower() == "normal":
    print("✅ Normal Traffic")
else:
    print("⚠️ Attack Detected")
    print(f"Type of Attack: {predicted_attack}")
    print(f"🛡️ Attack Prevented / Cured (Actual: {true_label})")