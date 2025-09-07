import pandas as pd
import joblib
import traceback

from AI.forecast_utils import forecast_monthly

# Load models and dataset
try:
    stock_df = pd.read_csv("AI/surplus_dataset.csv")
    scaler = joblib.load("AI/models/scaler.pkl")
    clf = joblib.load("AI/models/surplus_risk_model.pkl")
    encoder = joblib.load("AI/models/label_encoder.pkl")
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Model loading error: {e}")
    stock_df, scaler, clf, encoder = None, None, None, None


def to_python(obj):
    """Convert numpy types to native Python for JSON serialization"""
    if isinstance(obj, (pd.Series, pd.DataFrame)):
        return obj.to_dict()
    if hasattr(obj, "item"):
        try:
            return obj.item()
        except Exception:
            return obj
    if isinstance(obj, (list, tuple)):
        return [to_python(x) for x in obj]
    if isinstance(obj, dict):
        return {k: to_python(v) for k, v in obj.items()}
    return obj


def predict_surplus_from_forecast():
    try:
        if any(x is None for x in [stock_df, scaler, clf, encoder]):
            return {"predictions": [], "error": "Models not loaded properly"}
        
        forecast_response = forecast_monthly()
        if "forecasts" not in forecast_response:
            return {"predictions": [], "error": "No forecasts found in cache"}

        forecasts_data = forecast_response["forecasts"]
        if "forecasts" in forecasts_data:  # handle double nesting
            forecasts_data = forecasts_data["forecasts"]

        results = []
        for drug_code, months_data in forecasts_data.items():
            if "Month+1" not in months_data:
                continue

            forecast_demand = float(months_data.get("Month+1", 0))

            # Look up in CSV
            row = None
            if "DrugCode" in stock_df.columns:
                matches = stock_df[
                    stock_df["DrugCode"].str.strip().str.upper() == drug_code.strip().upper()
                ]
                if not matches.empty:
                    row = matches.iloc[0]

            if row is not None:
                feature_dict = {
                    "ForecastDemand": forecast_demand,
                    "CurrentStock": float(row["CurrentStock"]),
                    "Surplus": float(row["Surplus"]),
                    "ShelfLifeDays": int(row["ShelfLifeDays"]),
                    "LeadTimeDays": int(row["LeadTimeDays"]),
                    "UnitCost": float(row["UnitCost"]),
                    "WastageRate": float(row["WastageRate"]),
                }
            else:
                feature_dict = {
                    "ForecastDemand": forecast_demand,
                    "CurrentStock": float(forecast_demand * 1.2),
                    "Surplus": float(forecast_demand * 0.2),
                    "ShelfLifeDays": 180,
                    "LeadTimeDays": 30,
                    "UnitCost": float(forecast_demand * 0.1),
                    "WastageRate": 0.05,
                }

            # Scale + predict
            features_df = pd.DataFrame([feature_dict])
            features_scaled = scaler.transform(features_df)

            pred_class = int(clf.predict(features_scaled)[0])
            pred_label = str(encoder.inverse_transform([pred_class])[0])

            results.append({
                "drug": str(drug_code),
                "prediction": pred_label,
                "forecast_demand": forecast_demand,
                "features": to_python(feature_dict),
            })

        return {"predictions": results, "status": "success", "count": len(results)}

    except Exception as e:
        traceback.print_exc()
        return {"predictions": [], "error": str(e)}
