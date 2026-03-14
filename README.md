# Smart Flood Prediction AI 🌊

An interactive **real-time flood risk command center** for the **Pune Metropolitan Region**.  
Smart Flood Prediction AI simulates live sensor data, predicts flood risk using an AI-style model, and visualizes high‑risk zones on a satellite map so city officials can **act before streets go underwater**.

---

## 🚨 Problem Statement

Urban cities like Pune are increasingly hit by:

- **Sudden, intense rainfall**
- **Overloaded drainage systems**
- **Unplanned urbanization in low‑lying areas**

Most flood management today is **reactive**:
- Alerts are issued **after** waterlogging is visible.
- Data from sensors, weather, and topography is often **fragmented**.
- There is no **single live dashboard** to see:
  - Which neighborhoods are at risk
  - When flooding is likely to start
  - What actions to prioritize

---

## 💡 Our Solution

**Smart Flood Prediction AI** is a **single-pane-of-glass control dashboard** that:

- Simulates a **network of IoT flood sensors** across Pune (rainfall, water levels, drainage load, soil moisture, wind).
- Runs an AI‑style **risk model** (probability + ETA + confidence) per region.
- Projects the risk visually on a **live satellite map** using polygons for each neighborhood.
- Generates **AI-powered operational insights & recommended actions** for disaster teams.

It is built to look and feel like a **production‑grade NOC (Network Operations Center) dashboard**.

---

## ✨ Key Features

- **Real‑time Sensor Simulation**
  - City‑wide aggregation of rainfall, water level, drainage capacity, soil moisture, temperature, humidity, wind speed.
  - Data ticks every **1 second**, updating charts, map, and predictions.

- **Region‑level Flood Prediction**
  - Per‑region risk: **LOW / MEDIUM / HIGH**
  - **Flood probability (%)**
  - **ETA to flooding (minutes)**
  - **Model confidence (%)**
  - Elevation‑aware display for neighborhoods (e.g., Shivaji Nagar, Baner, Aundh, Wakad, Hinjewadi).

- **Interactive City Map (Pune)**
  - Satellite basemap via **Leaflet** (`react-leaflet`).
  - Polygon overlays for neighborhoods with dynamic colors based on risk.
  - Click a region to view **detailed readings** and **recommended actions**.
  - Smooth glassmorphism card for region details.

- **AI Insights Panel**
  - Auto‑generated natural‑language insights based on:
    - Number of high‑risk and medium‑risk regions
    - City‑wide rainfall and soil moisture
  - Examples:
    - “Critical situation in Shivaji Nagar, Baner…”
    - “Soil saturation is near capacity; any further rain will entirely result in surface flooding.”
  - Shows **model confidence window** and operational notes.

- **Analytics & Trends**
  - Time‑series charts for:
    - Rainfall
    - Water level
    - Drainage utilization
    - Flood probability
  - Keeps the last **60 seconds** of history for quick trend analysis.

- **Emergency Action Layer**
  - Generates **recommended emergency actions** by risk tier:
    - Clear drainage
    - Preposition pumps
    - Evacuate low‑lying zones
    - Activate shelters
  - Designed for quick briefings to decision makers.

- **Polished UX / UI**
  - Dark/light theme toggle.
  - Glassmorphism cards, premium typography, subtle animations.
  - Live badges, tick counters, and footer session info.

---

## 🧱 System Design

At a high level, the system behaves like a **mini end-to-end flood intelligence pipeline**, but entirely within the browser for hackathon speed.

**1. Data Layer (Simulated IoT + Environment)**

- `simulation.ts` generates and mutates:
  - Per‑region sensor readings (rainfall, water level, drainage load, soil moisture, etc.).
  - Timestamped history points for charts.
- Simulation ticks on an **interval (1s)** in `App.tsx`, updating:
  - Region states
  - Aggregated city metrics
  - Historical time series

> In a real deployment, this layer would be replaced by:
> - MQTT/HTTP streams from IoT gateways
> - Weather APIs / radar feeds
> - Hydrological model outputs

**2. Intelligence Layer (Risk & Insights Engine)**

- **Risk computation**:
  - `computeRisk` in `simulation.ts` converts sensor vectors into:
    - Risk level (LOW/MEDIUM/HIGH)
    - Flood probability (%)
    - ETA (minutes)
    - Confidence (%)
- **AI-style insights**:
  - `AiInsights` consumes:
    - Region risks (counts of HIGH/MEDIUM)
    - Aggregated rainfall & soil moisture
  - Emits human-readable **critical, warning, info, and operational** insights.

> This is the place where a real **ML model / API** can plug in later.

**3. Presentation Layer (Command Center UI)**

- **Global orchestration**: `App.tsx`
  - Holds canonical state for regions, history, sensors, theme, alerts.
  - Coordinates:
    - `SensorPanel` for live metric tiles
    - `FloodPrediction` for model output
    - `CityMap` for geospatial view
    - `Charts` for trends
    - `EmergencyReport` and `AiInsights` for actions & narrative.

- **Visualization**
  - `CityMap`:
    - Uses Leaflet polygons to represent neighborhoods.
    - Color encodes risk, with tooltips and detail panels.
  - `Charts`:
    - Plots the last 60 seconds of key metrics.

- **Interaction**
  - Click to select regions.
  - Toggle alerts (mute/unmute).
  - Reset simulation.
  - Switch between dark and light modes.

**4. Deployment Model**

- **Single Page Application (SPA)** built with Vite.
- Ships as a **static site** (`dist`) that can run on:
  - Netlify, Vercel, GitHub Pages, S3, or any static host.
- No backend is required for the demo; all logic stays client-side.

---

## 🏗️ Architecture Diagram (Conceptual)

Text-form conceptual diagram (suitable to draw in slides / whiteboard):

```text
                ┌───────────────────────────────┐
                │   External Data Sources*      │
                │  (IoT Sensors, Weather, etc.) │
                └──────────────┬────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                           │
│                                                                 │
│  ┌───────────────┐     ┌────────────────┐     ┌────────────────┐│
│  │ Simulation    │     │ Risk Engine   │     │ AI Insights     ││
│  │ (simulation.ts│ ───▶│ (computeRisk) │◀────│ (AiInsights)    ││
│  │ + timers)     │     └────────────────┘     └────────────────┘│
│  │  - regions    │             │                       ▲        │
│  │  - sensors    │             │                       │        │
│  │  - history    │             ▼                       │        │
│  └──────┬────────┘     ┌────────────────┐              │        │
│         │              │ App State      │──────────────┘        │
│         │              │ (App.tsx)      │                       │
│         │              │ - regions      │                       │
│         │              │ - history      │                       │
│         │              │ - alerts/theme │                       │
│         │              └──────┬─────────┘                       │
│         │                     │                                 │
│         │                     │                                 │
│         ▼                     ▼                                 │
│   ┌────────────┐   ┌───────────────────┐   ┌─────────────────┐ │
│   │ Charts     │   │ SensorPanel       │   │ FloodPrediction │ │
│   └────────────┘   └───────────────────┘   └─────────────────┘ │
│         ▲                     │                     ▲           │
│         │                     │                     │           │
│         │                     ▼                     │           │
│   ┌───────────────────────────────────────────────────────────┐ │
│   │ CityMap (react-leaflet) + EmergencyReport + Layout        │ │
│   └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

*In the hackathon version, "External Data Sources" are simulated locally.
```

Use this diagram in your presentation to explain how **data flows from sensors → risk engine → AI insights → visualization** all inside the browser.

---

## 🏗️ Architecture Overview

**Front-end only** (for hackathon speed), built with:

- **React + TypeScript + Vite**
- **Core components**
  - `App.tsx` – orchestrates simulation, state, and layout.
  - `SensorPanel` – shows aggregate IoT metrics.
  - `FloodPrediction` – AI model output & risk card.
  - `CityMap` – satellite map + polygons + region drill‑down.
  - `Charts` – live time‑series analytics.
  - `AiInsights` – AI-style narrative insights.
  - `EmergencyReport` – recommended emergency actions.
- **Simulation engine**
  - `simulation.ts` – generates regions, mutates sensor data over time, and computes risk.
  - `types.ts` – shared types for regions, sensors, charts, and risk.

There is **no backend dependency**; everything runs **locally in the browser** with a deterministic but realistic data simulation.

---

## 🧠 Risk Model (High-Level)

> Note: For hackathon/demo purposes, the “AI model” is implemented as a smart rules + scoring system, but the architecture is compatible with plugging in a real ML API.

Inputs per region:

- Rainfall intensity (mm/hr)
- Water level (cm)
- Drainage capacity usage (%)
- Soil moisture (%)
- Other micro‑climate signals (wind, humidity, temperature)

Outputs per region:

- **Risk level**: `LOW`, `MEDIUM`, `HIGH`
- **Flood probability (%)**
- **ETA to flooding (minutes or null)**
- **Model confidence (%)**

Logic outline:

- High rainfall + high soil moisture + high drainage usage → higher probability and shorter ETA.
- Aggregate city‑wide metrics to derive **overall risk** and **AI insights**.

---

## 🔧 Tech Stack

- **Framework**: React + TypeScript
- **Bundler**: Vite
- **Maps**: `react-leaflet` + Leaflet (World Imagery basemap)
- **Icons**: `lucide-react`
- **Styling**: CSS with design tokens for dark/light theme and glassmorphism

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/Tanishq-Raj/Smart-Flood-Prediction-AI.git
cd Smart-Flood-Prediction-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run in Development Mode

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

You’ll see:

- Live updating header with **LIVE** status, sensor nodes, tick counter, and theme toggle.
- Real‑time alert banner when high‑risk regions appear.
- Interactive Pune map and analytics.

---

## 📦 Production Build & Deployment

### Build

```bash
npm run build
```

This outputs a static bundle to the `dist` folder.

### Preview (optional)

```bash
npm run preview
```

### Deploy (examples)

- **Netlify / Vercel / Static Hosting**
  - Build with `npm run build`
  - Deploy the `dist` folder as your static site.
- **GitHub Pages**
  - Build with `npm run build`
  - Serve `dist` via any GitHub Pages static workflow.

---

## 🧪 Demo Script (For Judges)

1. **Start dashboard**
   - Open the app in the browser.
   - Point out header: “Smart Flood Prediction AI – Pune Metropolitan Region”.

2. **Explain live data**
   - Show sensor cards updating every second.
   - Highlight rainfall, water level, drainage, and soil moisture.

3. **Trigger risk changes (wait a few seconds)**
   - As simulations evolve, a **flood alert banner** appears when one or more regions hit **HIGH risk**.
   - Emphasize:
     - Probability number
     - ETA to flooding
     - Confidence score

4. **Map exploration**
   - Click on regions like **Baner**, **Aundh**, etc.
   - Show how polygons change color by risk.
   - Open the region details panel:
     - Live readings
     - Recommended actions

5. **AI Insights**
   - Scroll to the **AI Predictive Insights** panel.
   - Read out 1–2 generated insights:
     - Critical alerts
     - Infrastructure warnings
     - Operational notes

6. **Emergency actions**
   - Show **EmergencyReport** / action layer.
   - Explain how decision makers can quickly see:
     - Where to send pumps
     - When to alert citizens
     - When to evacuate

7. **Wrap up**
   - Highlight:
     - Real‑time situational awareness
     - Actionable AI insights
     - No backend dependency → easy to plug into real IoT + ML later.

---

## 🔮 Future Enhancements

- Plug in **real sensor feeds** and rainfall radar data.
- Replace rule‑based logic with a **trained ML model** (e.g., gradient boosting / deep learning).
- Add **SMS / WhatsApp alert integration** for citizens.
- Historical data storage and **post‑event analytics**.
- Integration with **municipal control rooms** and **GIS layers** (roads, hospitals, shelters).

---

## 👨‍💻 Team & Contributions

- **Author**: Tanishq Raj
- Built for a **hackathon** to demonstrate how AI + IoT + geospatial visualization can make cities safer against flash floods.

Contributions, suggestions, and forks are welcome!

