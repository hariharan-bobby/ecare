# CarePulse AI — Full Stack AI Elderly Care & Emergency Monitoring System

A production-ready healthcare monitoring platform combining an **ESP32 IoT simulation (Wokwi)** with a real-time **React Web Dashboard**, **Firebase integration**, **AI Voice Assistant**, and instant **Web Audio / Visual emergency alerts**.

---

## 🌟 Architecture Overview

```
 [ESP32 Sensors in Wokwi] ──(HTTP REST / Firebase SDK)──> [Firebase Realtime / Firestore]
 (DHT22, MPU6050, SOS, OLED)                                         │
                                                                 (Live Sync)
                                                                     ▼
 [Caregiver Web Dashboard] <──(Real-time Audio / Visual Alerts)──────┘
 (React + Vite + Tailwind + Web Speech API + Chart.js)
```

---

## 🚀 Key System Features

1. **IoT Emergency Detection (ESP32 Wokwi)**:
   - High Heart Rate (>120 BPM) / Low Heart Rate (<45 BPM)
   - Low SpO₂ (<90%)
   - High Temperature (>38°C)
   - MPU6050 Accelerometer Fall Detection
   - Physical SOS Panic Button
   - SSD1306 OLED Screen status display
   - Red/Green LEDs & Active Piezo Siren Buzzer actuation

2. **Real-time Caregiver Web Dashboard**:
   - Live telemetry grid (BPM, SpO₂, Temperature, GPS coordinates, Sensor health)
   - Real-time telemetry stream line chart (`Chart.js`)
   - Web Audio API alarm siren synthesizer (plays sound automatically on emergency)
   - High-priority blinking emergency card with 1-click incident acknowledgment
   - Simulated Wokwi alert triggers for immediate live preview

3. **Emergency Command & Dispatch Center**:
   - Interactive live GPS map location visualization
   - Caregiver emergency response checklist protocol
   - Incident notes log sync

4. **History & PDF Export**:
   - Searchable and filterable alert logs (by search query, date, severity)
   - One-click PDF export using `jsPDF` and `jspdf-autotable`

5. **AI Healthcare Features**:
   - **Voice Assistant**: Speech recognition via Web Speech API and spoken responses via SpeechSynthesis
   - **AI Risk Predictor**: Calculates patient health risk score based on vital trends
   - **Medication Scheduler**: Prescriptions manager with daily adherence tracker

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Chart.js, jsPDF
- **Backend / DB**: Firebase Firestore / Realtime Database, Firebase Authentication
- **IoT Simulation**: ESP32 (C++ Arduino firmware), DHT22, MPU6050, SSD1306 OLED, Piezo Buzzer, Wokwi

---

## 📥 Getting Started

### 1. Installation

```bash
# Clone or navigate to the project directory
cd eeee

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

The web dashboard will launch at `http://localhost:3000`.

---

## ⚡ Wokwi ESP32 Setup Guide

1. Open [Wokwi ESP32 Simulator](https://wokwi.com/projects/new/esp32).
2. Open `diagram.json` in Wokwi and paste the contents of [`wokwi/diagram.json`](wokwi/diagram.json).
3. Open `sketch.ino` in Wokwi and paste the contents of [`wokwi/esp32_firmware.ino`](wokwi/esp32_firmware.ino).
4. Press **Play** in Wokwi. Adjust the potentiometers for Heart Rate & SpO₂ or press the SOS button to trigger real-time telemetry!

---

## 🔐 Firebase Setup (Optional Environment Variables)

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

*Note: If no `.env` credentials are provided, the application runs seamlessly in **Demo & Live Simulation Mode** with zero configuration required!*

---

## 📄 Deployment Instructions

### Deploy to Vercel / Netlify

```bash
# Build production bundle
npm run build
```

Upload the generated `dist/` folder or link your Git repository to Vercel / Netlify.
