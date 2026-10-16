# Successful Prompts Log - 16 October 2026

Project: **SG AirAlert - Singapore Live PSI & Air Quality Monitor**  
Repository: [ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026](https://github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026)

---

## 1. Initial Frontend Build & Architecture

```text
build a singapore based application that tracks live PSI level and alerts users when air quality drops to unhealthy thresholds. it should include an interactive map and push notifications.

Build just the front end for now, i will add the serverless backed connection later
```

### Result & Features Implemented:
- Real-time Singapore PSI tracking mapped to NEA's 5 official air quality bands (Good, Moderate, Unhealthy, Very Unhealthy, Hazardous).
- Interactive SVG vector map of Singapore with regional sectors (North, South, East, West, Central) and offshore islands.
- Web Push Notifications API integration requesting browser permissions for instant threshold warnings.
- Web Audio API synthesizer generating dual-tone alert chimes and critical emergency sirens.
- Outdoor Activity Planner for Singapore landmarks (East Coast Park, MacRitchie Reservoir, Marina Bay, Jurong Lake Gardens, Sentosa).
- 24-hour historical hourly trend chart with threshold boundary guides.

---

## 2. Serverless Backend Integration (NEA Datamall)

```text
add a serverless connection that pulls live data from NEA Datamall using the following endpoints:

- store this in /api folder (project root level) not the src folder
- include /health.ts and /hazePSI.ts within that subfolder
- there is no API key

GET 
https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast

# accept: application/json
```

### Result & Features Implemented:
- Root-level serverless endpoint `/api/health.ts` for service uptime and upstream dependency status checks.
- Root-level serverless endpoint `/api/hazePSI.ts` querying:
  - `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`
  - `https://api.data.gov.sg/v1/environment/psi`
- Haze washout forecasting connecting rain/shower predictions across 47 Singapore towns to airborne particulate dispersal.
- Full-stack Express integration via `server.ts` mounting Vite middleware in development and static assets in production.
- `WeatherDispersalBanner` component added to the frontend overview.

---

## 3. GitHub Push & Version Control

```text
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026.git
```

### Result:
- Git repository initialized, configured, and committed with both frontend and backend modules.
- Remote set to `https://github.com/ricekoh2017-maker/SG-HAZE-FORECAST-OCT-2026.git`.
- Successfully pushed `main` branch to GitHub.
