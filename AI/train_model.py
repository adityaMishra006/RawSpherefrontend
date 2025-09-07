# AI/train_model.py

import pandas as pd
import numpy as np
import json
from tensorflow.keras.models import load_model
import joblib
from data_preprocess import preprocess

# 1. Load and preprocess
X, y, scalers, df = preprocess("AI/salesdaily.csv")
df["datum"] = pd.to_datetime(df["datum"], errors="coerce", infer_datetime_format=True)
# 2. Load trained LSTM model
model = load_model("AI/models/multi_meds_lstm.h5", compile=False)

# 3. Generate forecasts (e.g., 12 months ahead, using last 30 days)
num_meds = y.shape[1]
SEQ_LEN = X.shape[1]

values = df.drop(columns=["datum"]).fillna(0).values
current_seq = values[-SEQ_LEN:]

preds = []
for _ in range(365):  # 1 year horizon
    x = current_seq.reshape(1, SEQ_LEN, num_meds)
    pred = model.predict(x, verbose=0)[0]
    preds.append(pred)
    current_seq = np.vstack([current_seq[1:], pred])

preds = np.array(preds)

# 4. Inverse transform
forecast_daily = {}
for i, col in enumerate(df.drop(columns=["datum"]).columns):
    inv = scalers[col].inverse_transform(preds[:, i].reshape(-1, 1)).flatten()
    forecast_daily[col] = inv

# 5. Convert daily → monthly totals
future_dates = pd.date_range(
    start=df["datum"].max() + pd.Timedelta(days=1),
    periods=365,
    freq="D"
)
forecast_df = pd.DataFrame(forecast_daily, index=future_dates)
monthly = forecast_df.resample("M").sum()
monthly.index = monthly.index.strftime("%Y-%m")

# 6. Wrap into consistent dict format
final_forecasts = {"forecasts": {}}
for drug in monthly.columns:
    values = monthly[drug].tolist()
    final_forecasts["forecasts"][drug] = {
        f"Month+{i+1}": float(val) for i, val in enumerate(values[:12])  # only 12 months
    }

# 7. Save to cache
with open("predictions.json", "w") as f:
    json.dump(final_forecasts, f, indent=2)

print("✅ Forecasts saved to predictions.json in consistent format.")
