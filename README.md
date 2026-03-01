# Mi Body Composition Dashboard

A dynamic, multi-user web dashboard designed to visualize historical data exports from Xiaomi "Mi Body Composition Scales".

## 🚀 Features

- **Multi-User Tracking**: Organically tracks multiple user profiles parsed from overlapping raw CSV exports. It uniquely identifies which user the scale-reading belongs to dynamically via scale `height` metrics configureable via a `users.json` file.
- **Glassmorphic UI**: Enjoy a modern, dark-themed, glassmorphic UI interface built iteratively with vanilla HTML/CSS.
- **Dynamic Charting**: Features interactive charting powered by Chart.js. Click on any metric summary card (Weight, Body Fat, Muscle Mass, Body Water, BMI) to toggle that dataset onto the interactive graph. It cleanly interpolates data gaps for flawless trendlines.
- **Quick Dates**: Features responsive UX date tools to filter date ranges dynamically between users, with quick presets to snap to exactly `1 Year` views or `All Time`.

## 🛠️ Architecture

- **Backend (Python / FastAPI / SQLite)**: The core engine parses data securely. Drops from Zepp life/Xiaomi scale exports as `.csv` files inside the `backend/data/` directory are seamlessly fetched and ingested into the SQLite database. Duplicates are inherently ignored thanks to unique timescale constraints.
- **Frontend (Vanilla HTLM/JS / Nginx)**: The lightweight client securely fetches via the API.

## 📦 Getting Started

### 1. Configure Users
Before spinning up the environment for the first time, you must configure your user profiles so the backend knows how to intelligently assign scale readings.
1. Create a `backend/data/users.json` file (a template `users.sample.json` is provided).
2. Add your profiles, mapping `name` to the approximate `height` (in cm) registered in the Xiaomi app:

```json
{
    "users": [
        {
            "name": "JaneDoe",
            "height": 170.0
        },
        {
            "name": "JohnDoe",
            "height": 180.0
        }
    ]
}
```

### 2. Add Data
Drop your raw Xiaomi app `.csv` data exports directly into the `backend/data/` folder. The application supports an unlimited amount of tracking files. It will natively extract all files ending in `.csv` upon boot.

*(If no data is provided, the API will generate mock metrics for demonstration purposes).*

### 3. Run
The entire project architecture runs seamlessly through Docker Compose:

```bash
docker compose up -d --build
```

Access the dashboard natively at: `http://localhost:8080`
