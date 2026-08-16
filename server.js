import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let currentTelemetry = {
  heartRate: 75,
  spo2: 98,
  temperature: 36.8,
  fallDetected: false,
  sosPressed: false,
  emergency: false,
  emergencyType: "NORMAL",
  status: "Stable",
  timestamp: new Date().toLocaleTimeString()
};

// Endpoint for ESP32 / Wokwi / cURL to post latest sensor readings
app.all('/api/telemetry', (req, res) => {
  if (req.body && Object.keys(req.body).length > 0) {
    currentTelemetry = {
      ...currentTelemetry,
      ...req.body,
      timestamp: new Date().toLocaleTimeString()
    };
    console.log("📥 Received live telemetry payload:", currentTelemetry);
  }
  res.json(currentTelemetry);
});

// Endpoint for Web Application to fetch current sensor readings
app.get('/api/patient', (req, res) => {
  res.json(currentTelemetry);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CarePulse Telemetry Gateway running on http://localhost:${PORT}`);
});
