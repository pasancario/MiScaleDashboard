# Future Planning & Roadmap

This document outlines potential new functionalities and enhancements for the Mi Body Composition Dashboard.

## 🎯 1. Goal Tracking & Milestones
- **Feature**: Allow users to configure target metrics (e.g., Target Weight: 75kg, Target Body Fat: 15%) within their `users.json` or a dedicated DB table.
- **UI Element**: Add a horizontal "Goal Line" annotation on the Chart.js graph.
- **UI Element**: Add a progress bar or delta indicator on the metric cards (e.g., "Weight: 80kg (5kg to go!)").

## 📈 2. Advanced Analytics & Smoothing
- **Feature**: Daily weigh-ins can be noisy. Add a toggle for "7-Day Moving Average" or "30-Day Moving Average" to smooth out the trend lines.
- **UI Element**: A toggle switch next to the Date Range selectors to activate/deactivate trend smoothing.

## ☁️ 3. Direct Zepp Life / Mi Fit API Integration
- **Feature**: Move away from manual CSV drops by fully integrating with the Zepp Life API.
- **Mechanism**: Provide a configuration for `ZEPP_APP_TOKEN` or username/password to run a background cron job inside the backend container that fetches new readings daily and inserts them directly into SQLite.

## 📊 4. Expanded Metric Support
- **Feature**: The Xiaomi scale records more than just Weight, Body Fat, Muscle Mass, and Water. We should extract and visualize:
  - Visceral Fat
  - Bone Mass
  - Basal Metabolic Rate (BMR)
  - Protein Percentage
  - Metabolic Age
- **Mechanism**: Update `models.py` schema, CSV parser, and frontend cards dynamically.

## 📱 5. PWA (Progressive Web App) & Mobile Refinements
- **Feature**: Enhance the glassmorphism CSS and HTML meta tags to make the app installable on iOS/Android home screens as a PWA.
- **UI Element**: Add a manifest file and service workers for offline caching of the latest data.

## 🌙 6. Light / Dark Mode Toggle
- **Feature**: The dashboard currently defaults to a hardcoded dark theme. Implement standard CSS variables (`:root` vs `[data-theme="light"]`) to allow users to toggle themes.

## 📤 7. Data Export functionality
- **Feature**: A UI button to download the cleaned, aggregated SQLite database records back into a standardized CSV or JSON format for use in other fitness apps or systems.

---
*Feel free to adjust this document as project priorities change.*
