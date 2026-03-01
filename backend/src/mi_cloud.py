import logging
import os
import requests
import csv
from datetime import datetime

logger = logging.getLogger(__name__)

def get_measurements():
    """
    Returns data from local environment variables / CSV files.
    """
    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    
    csv_data = []
    
    if os.path.exists(data_dir):
        for filename in os.listdir(data_dir):
            if filename.endswith(".csv"):
                filepath = os.path.join(data_dir, filename)
                logger.info(f"Parsing CSV file: {filepath}")
                csv_data.extend(parse_xiaomi_csv(filepath))
                
    if csv_data:
        return csv_data
        
    logger.info("No CSV files found in data directory. Returning mock data.")
    return generate_mock_data()

def parse_xiaomi_csv(filepath: str):
    data = []
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    def get_float(key):
                        val = row.get(key)
                        if val and val.lower() != 'null':
                            return float(val)
                        return None
                        
                    # The time format is like "2021-05-03 05:44:24+0000"
                    time_str = row.get("time", "")
                    if not time_str:
                        continue
                    if "+" in time_str:
                        time_str = time_str.split("+")[0].strip()
                    
                    data.append({
                        "timestamp": time_str,
                        "height": get_float("height"),
                        "weight": get_float("weight"),
                        "body_fat": get_float("fatRate"),
                        "muscle_mass": get_float("muscleRate"),
                        "water_percentage": get_float("bodyWaterRate"),
                        "bmi": get_float("bmi"),
                        "bone_mass": get_float("boneMass"),
                        "basal_metabolism": get_float("metabolism"),
                        "visceral_fat": get_float("visceralFat")
                    })
                except Exception as e:
                    logger.error(f"Error parsing row: {e}")
    except Exception as e:
        logger.error(f"Error reading file {filepath}: {e}")
    return data

def fetch_from_zepp_api(app_token: str):
    """
    Conceptual implementation of the undocumented Zepp Life API.
    Requires an app token extracted from the Zepp mobile app's database or web portal.
    """
    url = "https://api-mifit.huami.com/v1/data/band_data.json"
    headers = {"apptoken": app_token}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        # raw_data = response.json()
        # Parse and return formatted json
        return [] # Placeholder
    except Exception as e:
        logger.error(f"Zepp API Error: {e}")
        return []

def generate_mock_data():
    import random
    mock_data = []
    base_weight = 75.0
    for i in range(30):
        weight = base_weight + random.uniform(-1.0, 1.0)
        base_weight = weight
        mock_data.append({
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
            "weight": round(weight, 1),
            "body_fat": round(20.0 + random.uniform(-0.5, 0.5), 1),
            "muscle_mass": round(50.0 + random.uniform(-0.2, 0.2), 1),
            "bmi": round(weight / ((1.75)**2), 1)
        })
    return mock_data
