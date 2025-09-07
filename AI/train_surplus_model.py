# AI/train_model.py

import pandas as pd
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# 1. Load synthetic dataset
df = pd.read_csv("AI/surplus_dataset.csv")

# 2. Define features and target
features = [
    "ForecastDemand",
    "CurrentStock",
    "Surplus",
    "ShelfLifeDays",
    "LeadTimeDays",
    "UnitCost",
    "WastageRate"
]
X = df[features]
y = df["RiskLabel"]

# 3. Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# 4. Scale numerical features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

# 6. Train RandomForest model
clf = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)
clf.fit(X_train, y_train)

# 7. Evaluate
y_pred = clf.predict(X_test)
print("✅ Accuracy:", accuracy_score(y_test, y_pred))
print(classification_report(y_test, y_pred, target_names=encoder.classes_))

# 8. Save model & preprocessors
joblib.dump(clf, "AI/models/surplus_risk_model.pkl")
joblib.dump(scaler, "AI/models/scaler.pkl")
joblib.dump(encoder, "AI/models/label_encoder.pkl")

print("🎉 Surplus risk model trained and saved successfully.")
