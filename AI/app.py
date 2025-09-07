from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from AI.forecast_utils import forecast_monthly
from AI.surplus_utils import predict_surplus_from_forecast

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/forecast_monthly")
def get_forecast_monthly():
    return forecast_monthly()

@app.get("/market_demand")
def market_demand():
    forecast_data = forecast_monthly()
    if "forecasts" not in forecast_data:
        return {"insights": []}

    forecasts = forecast_data["forecasts"]
    month_key = "Month+1"

    max_drug, max_val = None, -1
    for drug, months in forecasts.items():
        val = float(months.get(month_key, 0))
        if val > max_val:
            max_drug, max_val = drug, val

    insights = []
    for drug, months in forecasts.items():
        demand_val = float(months.get(month_key, 0))
        trend = "Stable"
        if drug == max_drug:
            trend = "High"

        insights.append({
            "drug": drug,
            "trend": trend,
            "forecast": demand_val,
        })

    return {"insights": insights}

@app.get("/forecast_periods")
def get_forecast_periods():
    """Aggregate monthly forecasts into 1m, 3m, 6m, 12m totals."""
    base = forecast_monthly()
    if "forecasts" not in base:
        return {"error": "No forecasts available"}
    
    forecasts = base["forecasts"]
    results = {"1_month": {}, "3_months": {}, "6_months": {}, "12_months": {}}

    for drug, months in forecasts.items():
        month_keys = list(months.keys())
        values = [months[m] for m in month_keys]

        results["1_month"][drug] = float(sum(values[:1]))
        results["3_months"][drug] = float(sum(values[:3]))
        results["6_months"][drug] = float(sum(values[:6]))
        results["12_months"][drug] = float(sum(values[:12]))

    return {"forecasts": results}

@app.get("/predict_surplus_auto")
def get_surplus_predictions():
    return predict_surplus_from_forecast()
