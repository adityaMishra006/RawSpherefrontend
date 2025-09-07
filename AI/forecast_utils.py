import json
import os
import time

CACHE_FILE = "predictions.json"
REFRESH_INTERVAL = 6 * 60 * 60  # 6 hours in seconds


def _load_from_cache():
    """Load forecasts from cache if valid."""
    if not os.path.exists(CACHE_FILE):
        return None

    # Check file age
    mtime = os.path.getmtime(CACHE_FILE)
    if time.time() - mtime > REFRESH_INTERVAL:
        # cache is stale
        return None

    with open(CACHE_FILE, "r") as f:
        return json.load(f)


def _recompute_forecast():
    """
    Placeholder: recompute forecast & save to cache.
    Replace this with your real ML prediction pipeline.
    """
    dummy_forecasts = {
        "M01AB": {"Month+1": 5.6, "Month+2": 5.4, "Month+3": 5.3},
        "M01AE": {"Month+1": 4.0, "Month+2": 3.9, "Month+3": 3.8},
    }

    with open(CACHE_FILE, "w") as f:
        json.dump(dummy_forecasts, f, indent=2)

    return dummy_forecasts


def forecast_monthly():
    """Return forecasts, refreshing cache every 6 hours."""
    forecasts = _load_from_cache()
    if forecasts is None:
        forecasts = _recompute_forecast()

    return {"forecasts": forecasts}
