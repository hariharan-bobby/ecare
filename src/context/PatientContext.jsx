import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { doc, onSnapshot, collection, query, orderBy, limit, addDoc, updateDoc } from 'firebase/firestore';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

const INITIAL_PATIENT = {
  id: 'patient001',
  name: 'Eleanor Vance',
  age: 78,
  room: 'Bed 402 - East Wing',
  heartRate: 74,
  spo2: 98,
  temperature: 36.8,
  fallDetected: false,
  sosPressed: false,
  emergency: false,
  emergencyType: 'NORMAL', // 'HIGH_HEART_RATE', 'LOW_SPO2', 'HIGH_TEMP', 'FALL_DETECTED', 'SOS_PRESSED'
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
    { time: '12:00', heartRate: 72, spo2: 98, temp: 36.6 },
    { time: '12:05', heartRate: 75, spo2: 97, temp: 36.7 },
    { time: '12:10', heartRate: 74, spo2: 98, temp: 36.8 },
    { time: '12:15', heartRate: 78, spo2: 98, temp: 36.8 },
    { time: '12:20', heartRate: 73, spo2: 99, temp: 36.7 }
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

      if (sirenOscRef.current) return; // already playing

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      
      // Siren frequency modulation pattern
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

  // Manage alarm sound based on emergency state & mute toggle
  useEffect(() => {
    if (patientData.emergency && !isAudioMuted) {
      startAlarmSound();
    } else {
      stopAlarmSound();
    }
    return () => stopAlarmSound();
  }, [patientData.emergency, isAudioMuted]);

  // Firestore sync if connected
  useEffect(() => {
    if (db && import.meta.env.VITE_FIREBASE_API_KEY) {
      const patientRef = doc(db, 'patients', 'patient001');
      const unsubDoc = onSnapshot(patientRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPatientData(prev => ({ ...prev, ...data }));
        }
      });

      return () => unsubDoc();
    }
  }, []);

  // Background smooth trend simulation for realistic sensor live feed
  useEffect(() => {
    const timer = setInterval(() => {
      setPatientData(prev => {
        if (prev.emergency) return prev; // Hold static emergency vitals until resolved

        // Slight jitter simulation
        const hrDelta = (Math.random() - 0.5) * 2;
        const newHR = Math.min(130, Math.max(40, Math.round(prev.heartRate + hrDelta)));
        
        const spo2Delta = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newSpO2 = Math.min(100, Math.max(85, prev.spo2 + spo2Delta));

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Update vital history stream
        setVitalHistory(h => [
          ...h.slice(-15),
          { time: timeStr, heartRate: newHR, spo2: newSpO2, temp: prev.temperature }
        ]);

        return {
          ...prev,
          heartRate: newHR,
          spo2: newSpO2,
          timestamp: timeStr
        };
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Trigger simulated emergency manually for testing dashboard/alarms
  const triggerEmergency = (type) => {
    let updated = { ...patientData, emergency: true, emergencyType: type, status: 'CRITICAL ALERT' };

    if (type === 'HIGH_HEART_RATE') {
      updated.heartRate = 138;
    } else if (type === 'LOW_SPO2') {
      updated.spo2 = 86;
    } else if (type === 'HIGH_TEMP') {
      updated.temperature = 39.2;
    } else if (type === 'FALL_DETECTED') {
      updated.fallDetected = true;
    } else if (type === 'SOS_PRESSED') {
      updated.sosPressed = true;
    }

    setPatientData(updated);

    // Create new emergency alert record
    const newAlert = {
      id: 'alt-' + Date.now(),
      patientId: updated.id,
      patientName: updated.name,
      type: type,
      message: `Emergency Alert: ${type.replace(/_/g, ' ')} detected! Immediate caregiver action required.`,
      timestamp: new Date().toLocaleString(),
      acknowledged: false,
      severity: 'CRITICAL',
      vitalsSnapshot: { heartRate: updated.heartRate, spo2: updated.spo2, temp: updated.temperature }
    };

    setAlerts(prev => [newAlert, ...prev]);
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

  // Immediate Telemetry & Emergency Threshold Evaluation Engine (0ms instant update)
  const updateVitalsDirectly = (newVitals) => {
    setPatientData(prev => {
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

        // Add to alert history log
        setAlerts(aPrev => [
          {
            id: 'alt-' + Date.now(),
            patientId: merged.id,
            patientName: merged.name,
            type: eType,
            message: `Immediate Wokwi Telemetry Alert: ${eType.replace(/_/g, ' ')} threshold breach detected!`,
            timestamp: new Date().toLocaleString(),
            acknowledged: false,
            severity: 'CRITICAL',
            vitalsSnapshot: { heartRate: merged.heartRate, spo2: merged.spo2, temp: merged.temperature }
          },
          ...aPrev
        ]);
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

  // Expose global window helper for zero-delay Wokwi REST testing
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
