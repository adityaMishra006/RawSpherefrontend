import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib, os

def preprocess(csv_path="AI/salesdaily.csv", seq_len=30):
    # Load your CSV
    df = pd.read_csv(csv_path, parse_dates=["datum"])

    # Drop date column, keep only medicine sales
    data = df.drop(columns=["datum"]).fillna(0)

    # Scale each medicine column independently
    scaled = pd.DataFrame()
    scalers = {}

    for col in data.columns:
        scaler = MinMaxScaler()
        scaled[col] = scaler.fit_transform(data[[col]]).flatten()
        scalers[col] = scaler

    # Save scalers for later use
    os.makedirs("AI/models", exist_ok=True)
    joblib.dump(scalers, "AI/models/scalers.joblib")

    # Create sequences for LSTM
    X, y = [], []
    values = scaled.values
    for i in range(len(values) - seq_len):
        X.append(values[i:i+seq_len])      # past 30 days
        y.append(values[i+seq_len])        # next day for all medicines

    X, y = np.array(X), np.array(y)
    print("X shape:", X.shape, "y shape:", y.shape)
    return X, y, scalers, df
