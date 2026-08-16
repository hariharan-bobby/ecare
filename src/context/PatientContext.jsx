import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

const INITIAL_PATIENT = {
  id: 'patient001',
  name: 'Eleanor Vance',
  age: 78,
  room: 'Bed 402 - East Wing',
  heartRate: 75,
  spo2: 98,
  temperature: 36.8,
  fallDetected: false,
  sosPressed: false,
  emergency: false,
  emergencyType: 'NORMAL',
  latitude: 37.774929,
  longitude: -122.419416,
  timestamp: new Date().toLocaleTimeString(),
  status: 'Stable',
  sensorHealth: 'Optimal'
};

const INITIAL_ALERTS = [
  {
    id: 'alt-001',
    patientId: 'patient001',
    patientName: 'Eleanor Vance',
    type: 'SOS_PRESSED',
    message: 'Patient triggered physical SOS panic button',
    timestamp: new Date(Date.now() - 3600000).toLocaleString(),
    acknowledged: true,
    severity: 'High',
    vitalsSnapshot: { heartRate: 118, spo2: 94, temp: 37.5 }
  },
  {
    id: 'alt-002',
    patientId: 'patient001',
    patientName: 'Eleanor Vance',
    type: 'HIGH_TEMP',
    message: 'Elevated body temperature detected (38.4°C)',
    timestamp: new Date(Date.now() - 86400000).toLocaleString(),
    acknowledged: true,
    severity: 'Medium',
    vitalsSnapshot: { heartRate: 98, spo2: 96, temp: 38.4 }
  }
];

export const PatientProvider = ({ children }) => {
  const [patientData, setPatientData] = useState(INITIAL_PATIENT);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [vitalHistory, setVitalHistory] = useState([
    { time: '12:00', heartRate: 75, spo2: 98, temp: 36.8 },
    { time: '12:05', heartRate: 75, spo2: 98, temp: 36.8 },
    { time: '12:10', heartRate: 74, spo2: 98, temp: 36.8 },
    { time: '12:15', heartRate: 78, spo2: 98, temp: 36.8 },
    { time: '12:20', heartRate: 75, spo2: 98, temp: 36.8 }
  ]);

  const audioCtxRef = useRef(null);
  const sirenOscRef = useRef(null);
  const sirenGainRef = useRef(null);

  // Sound Siren Alarm generator using Web Audio API
  const startAlarmSound = () => {
    if (isAudioMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (sirenOscRef.current) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      let high = true;
      const interval = setInterval(() => {
        if (!sirenOscRef.current) {
          clearInterval(interval);
          return;
        }
        osc.frequency.setValueAtTime(high ? 950 : 600, ctx.currentTime);
        high = !high;
      }, 400);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      sirenOscRef.current = osc;
      sirenGainRef.current = gain;
    } catch (e) {
      console.warn("Web Audio alert sound initialisation error:", e);
    }
  };

  const stopAlarmSound = () => {
    if (sirenOscRef.current) {
      try {
        sirenOscRef.current.stop();
        sirenOscRef.current.disconnect();
      } catch (e) {}
      sirenOscRef.current = null;
    }
  };

  // Manage alarm sound based on emergency state
  useEffect(() => {
    if (patientData.emergency && !isAudioMuted) {
      startAlarmSound();
    } else {
      stopAlarmSound();
    }
    return () => stopAlarmSound();
  }, [patientData.emergency, isAudioMuted]);

  // Firestore live sync if API key is provided
  useEffect(() => {
    if (db && import.meta.env.VITE_FIREBASE_API_KEY) {
      const patientRef = doc(db, 'patients', 'patient001');
      const unsubDoc = onSnapshot(patientRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          updateVitalsDirectly(data);
        }
      });
      return () => unsubDoc();
    }
  }, []);

  // FAST 1-SECOND AUTOMATIC WOKWI REST POLLING (Automatic Wokwi Telemetry Sync)
  useEffect(() => {
    const pollEndpoint = "https://elderly-care-assistant-default-rtdb.firebaseio.com/patients/patient001.json";
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(pollEndpoint);
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            updateVitalsDirectly(data);
          }
        }
      } catch (e) {
        // Silent catch if offline
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Immediate Telemetry & Emergency Threshold Evaluation Engine (0ms instant update)
  const updateVitalsDirectly = (newVitals) => {
    setPatientData(prev => {
      // Avoid unnecessary re-renders if values haven't changed
      if (
        newVitals.heartRate === prev.heartRate &&
        newVitals.spo2 === prev.spo2 &&
        newVitals.temperature === prev.temperature &&
        newVitals.fallDetected === prev.fallDetected &&
        newVitals.sosPressed === prev.sosPressed &&
        newVitals.emergency === prev.emergency
      ) {
        return prev;
      }

      const merged = { ...prev, ...newVitals };
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      merged.timestamp = timeStr;

      // Evaluate Threshold Rules
      let isEmerg = false;
      let eType = 'NORMAL';

      if (merged.sosPressed) {
        isEmerg = true;
        eType = 'SOS_PRESSED';
      } else if (merged.fallDetected) {
        isEmerg = true;
        eType = 'FALL_DETECTED';
      } else if (merged.heartRate > 120) {
        isEmerg = true;
        eType = 'HIGH_HEART_RATE';
      } else if (merged.heartRate < 45) {
        isEmerg = true;
        eType = 'LOW_HEART_RATE';
      } else if (merged.spo2 < 90) {
        isEmerg = true;
        eType = 'LOW_SPO2';
      } else if (merged.temperature > 38.0) {
        isEmerg = true;
        eType = 'HIGH_TEMP';
      }

      if (isEmerg) {
        merged.emergency = true;
        merged.emergencyType = eType;
        merged.status = 'CRITICAL ALERT';

        // Add to alert history log if new emergency
        if (!prev.emergency) {
          setAlerts(aPrev => [
            {
              id: 'alt-' + Date.now(),
              patientId: merged.id,
              patientName: merged.name,
              type: eType,
              message: `Automatic Wokwi Telemetry Alert: ${eType.replace(/_/g, ' ')} detected!`,
              timestamp: new Date().toLocaleString(),
              acknowledged: false,
              severity: 'CRITICAL',
              vitalsSnapshot: { heartRate: merged.heartRate, spo2: merged.spo2, temp: merged.temperature }
            },
            ...aPrev
          ]);
        }
      } else if (!prev.emergency) {
        merged.status = 'Stable';
      }

      // Update real-time line chart stream
      setVitalHistory(h => [
        ...h.slice(-15),
        { time: timeStr, heartRate: merged.heartRate, spo2: merged.spo2, temp: merged.temperature }
      ]);

      return merged;
    });
  };

  const triggerEmergency = (type) => {
    let payload = { emergency: true, emergencyType: type, status: 'CRITICAL ALERT' };

    if (type === 'HIGH_HEART_RATE') payload.heartRate = 138;
    else if (type === 'LOW_SPO2') payload.spo2 = 86;
    else if (type === 'HIGH_TEMP') payload.temperature = 39.2;
    else if (type === 'FALL_DETECTED') payload.fallDetected = true;
    else if (type === 'SOS_PRESSED') payload.sosPressed = true;

    updateVitalsDirectly(payload);
  };

  const resolveEmergency = () => {
    setPatientData(prev => ({
      ...prev,
      emergency: false,
      fallDetected: false,
      sosPressed: false,
      emergencyType: 'NORMAL',
      heartRate: 75,
      spo2: 98,
      temperature: 36.8,
      status: 'Stable'
    }));
    stopAlarmSound();
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
  };

  // Expose global window helper for zero-delay browser console / dev testing
  useEffect(() => {
    window.updatePatientVitals = updateVitalsDirectly;
    return () => { delete window.updatePatientVitals; };
  }, []);

  return (
    <PatientContext.Provider value={{
      patientData,
      setPatientData,
      updateVitalsDirectly,
      alerts,
      vitalHistory,
      triggerEmergency,
      resolveEmergency,
      acknowledgeAlert,
      isAudioMuted,
      setIsAudioMuted
    }}>
      {children}
    </PatientContext.Provider>
  );
};
