import pandas as pd
import numpy as np
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.preprocessing import StandardScaler

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# ==============================
# STEP 1: DEFINE NSL-KDD COLUMNS
# ==============================
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

# ==============================
# STEP 2: LOAD DATASETS
# ==============================
train_data = pd.read_csv("KDDTrain+.csv", names=columns)
test_data = pd.read_csv("KDDTest+.csv", names=columns)

print("Train Dataset Loaded:", train_data.shape)
print("Test Dataset Loaded:", test_data.shape)

# ==============================
# STEP 3: DROP DIFFICULTY COLUMN
# ==============================
train_data = train_data.drop("difficulty", axis=1)
test_data = test_data.drop("difficulty", axis=1)

# ==============================
# STEP 4: ENCODE CATEGORICAL DATA
# ==============================
protocol_encoder = LabelEncoder()
service_encoder = LabelEncoder()
flag_encoder = LabelEncoder()

train_data["protocol_type"] = protocol_encoder.fit_transform(train_data["protocol_type"])
test_data["protocol_type"] = protocol_encoder.transform(test_data["protocol_type"])

train_data["service"] = service_encoder.fit_transform(train_data["service"])
test_data["service"] = service_encoder.transform(test_data["service"])

train_data["flag"] = flag_encoder.fit_transform(train_data["flag"])
test_data["flag"] = flag_encoder.transform(test_data["flag"])

# ==============================
# STEP 5: ENCODE ATTACK LABELS (MULTI-CLASS) SAFELY
# ==============================
attack_encoder = LabelEncoder()
train_data["class"] = attack_encoder.fit_transform(train_data["class"])

# Remove unseen labels in test set
test_data = test_data[test_data["class"].isin(attack_encoder.classes_)]
test_data["class"] = attack_encoder.transform(test_data["class"])

print("Classes:", list(attack_encoder.classes_))

# ==============================
# STEP 6: SPLIT FEATURES/LABELS
# ==============================
X_train = train_data.drop("class", axis=1)
y_train = train_data["class"]

X_test = test_data.drop("class", axis=1)
y_test = test_data["class"]

# ==============================
# STEP 7: NORMALIZE FEATURES
# ==============================
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# ==============================
# STEP 8: RESHAPE FOR LSTM
# ==============================
X_train = np.reshape(X_train, (X_train.shape[0], 1, X_train.shape[1]))
X_test = np.reshape(X_test, (X_test.shape[0], 1, X_test.shape[1]))

# ==============================
# STEP 9: BUILD LSTM MODEL
# ==============================
model = Sequential()
model.add(LSTM(64, input_shape=(1, X_train.shape[2])))
model.add(Dropout(0.2))
model.add(Dense(32, activation="relu"))
model.add(Dense(len(attack_encoder.classes_), activation="softmax"))  # Multi-class output

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

print(model.summary())

# ==============================
# STEP 10: TRAIN MODEL
# ==============================
model.fit(
    X_train,
    y_train,
    epochs=10,
    batch_size=64,
    validation_data=(X_test, y_test)
)

# ==============================
# STEP 11: EVALUATE MODEL
# ==============================
loss, accuracy = model.evaluate(X_test, y_test)
print("IDS Multi-class Model Accuracy:", accuracy)

# ==============================
# STEP 12: SAVE MODEL + TOOLS
# ==============================
model.save("ids_lstm_model.h5")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(protocol_encoder, "protocol_encoder.pkl")
joblib.dump(service_encoder, "service_encoder.pkl")
joblib.dump(flag_encoder, "flag_encoder.pkl")
joblib.dump(attack_encoder, "attack_encoder.pkl")

print("Model and preprocessing tools saved successfully!")