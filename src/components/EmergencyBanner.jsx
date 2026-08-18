import React from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  PhoneCall, 
  Volume2, 
  VolumeX,
  Heart,
  Thermometer,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmergencyBanner = () => {
  const { patientData, resolveEmergency, isAudioMuted, setIsAudioMuted } = usePatient();
  const navigate = useNavigate();

  if (!patientData.emergency) return null;

  const formatType = (type) => {
    switch (type) {
      case 'HIGH_HEART_RATE': return 'CRITICAL HIGH HEART RATE (>120 BPM)';
      case 'LOW_SPO2': return 'DANGEROUS LOW SPO₂ LEVEL (<90%)';
      case 'HIGH_TEMP': return 'ELEVATED FEVER TEMPERATURE (>38°C)';
      case 'FALL_DETECTED': return 'PATIENT FALL DETECTED (MPU6050 Accelerometer)';
      case 'SOS_PRESSED': return 'MANUAL SOS EMERGENCY PANIC BUTTON PRESSED';
      default: return 'MEDICAL EMERGENCY DETECTED';
    }
  };

  return (
    <div className="mb-6 p-4 lg:p-6 rounded-2xl bg-gradient-to-r from-red-950/90 via-rose-900/80 to-red-950/90 border-2 border-red-500 animate-emergency shadow-2xl relative overflow-hidden">
      
      {/* Background animated radar pulse visual */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 rounded-full bg-red-500/10 pulse-ring pointer-events-none"></div>

      {/* Top Right Close (X) Button */}
      <button
        onClick={resolveEmergency}
        className="absolute top-3 right-3 p-1.5 rounded-xl bg-red-950/80 hover:bg-red-800 text-slate-300 hover:text-white border border-red-500/40 transition-all z-20"
        title="Close & Clear Emergency Banner"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10 pr-6">
        
        {/* Warning Icon & Details */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/50 animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-500 text-white uppercase tracking-wider animate-pulse">
                🚨 CRITICAL EMERGENCY
              </span>
              <span className="text-xs text-red-200">{patientData.timestamp}</span>
            </div>
            
            <h2 className="text-lg lg:text-xl font-black text-white mt-1 font-heading">
              {formatType(patientData.emergencyType)}
            </h2>

            <p className="text-xs text-red-200/90 mt-0.5">
              Patient: <strong className="text-white">{patientData.name}</strong> ({patientData.room}) — Telemetry threshold breach detected by ESP32 sensors.
            </p>

            {/* Vitals Quick Grid */}
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-500/30 text-white flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>HR: <strong className={patientData.heartRate > 120 ? 'text-red-400' : ''}>{patientData.heartRate} BPM</strong></span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-500/30 text-white flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>SpO₂: <strong className={patientData.spo2 < 90 ? 'text-red-400' : ''}>{patientData.spo2}%</strong></span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-500/30 text-white flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Temp: <strong>{patientData.temperature}°C</strong></span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-red-500/30 text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>GPS: <strong>{patientData.latitude.toFixed(4)}, {patientData.longitude.toFixed(4)}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="px-3.5 py-2 rounded-xl bg-red-900/60 border border-red-700/80 text-white hover:bg-red-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse text-yellow-300" />}
            <span>{isAudioMuted ? "Unmute Siren" : "Mute Siren"}</span>
          </button>

          <button
            onClick={() => navigate('/emergency')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
          >
            <MapPin className="w-4 h-4" />
            <span>Emergency Panel & Map</span>
          </button>

          <button
            onClick={resolveEmergency}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-900/40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Acknowledge & Resolve</span>
          </button>
        </div>

      </div>
    </div>
  );
};
