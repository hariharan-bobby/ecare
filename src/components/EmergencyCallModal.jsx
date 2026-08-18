import React, { useEffect, useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  PhoneCall, 
  PhoneOff, 
  ShieldAlert, 
  MapPin, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  UserCheck,
  Heart,
  Thermometer,
  Activity,
  AlertTriangle
} from 'lucide-react';

export const EmergencyCallModal = () => {
  const { patientData, resolveEmergency, isAudioMuted, setIsAudioMuted } = usePatient();
  const [callStatus, setCallStatus] = useState('DIALING'); // 'DIALING' | 'RINGING' | 'CONNECTED'
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!patientData.emergency) {
      setCallStatus('DIALING');
      setTimer(0);
      return;
    }

    // Speak out emergency voice prompt using Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Emergency alert! ${patientData.name} requires immediate assistance for ${patientData.emergencyType.replace(/_/g, ' ')}. Automatically calling caregiver now.`;
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 1.0;
      window.speechSynthesis.speak(msg);
    }

    // Call state progression simulation: DIALING -> RINGING -> CONNECTED
    const t1 = setTimeout(() => setCallStatus('RINGING'), 1500);
    const t2 = setTimeout(() => setCallStatus('CONNECTED'), 4000);

    const interval = setInterval(() => setTimer(t => t + 1), 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [patientData.emergency, patientData.emergencyType]);

  if (!patientData.emergency) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* Flashing Emergency Modal Card */}
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 border-2 border-red-500 shadow-2xl animate-emergency relative overflow-hidden text-center space-y-6">
        
        {/* Background pulsing ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-red-600/10 pulse-ring pointer-events-none"></div>

        {/* Top Close (X) Button */}
        <button
          onClick={resolveEmergency}
          className="absolute top-4 right-4 p-2 rounded-full bg-red-900/60 hover:bg-red-800 text-white/80 hover:text-white transition-all border border-red-500/40 z-20"
          title="Close Emergency Popup & Silence Siren"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Top Warning Badge */}
        <div className="flex items-center justify-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-widest animate-bounce">
            🚨 AUTOMATIC CAREGIVER CALL DISPATCH
          </span>
        </div>

        {/* Call Icon & Call Status */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <PhoneCall className="w-10 h-10 text-white animate-bounce" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </span>
        </div>

        {/* Call Details */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
            {callStatus === 'DIALING' && 'Auto-Dialing Caregiver...'}
            {callStatus === 'RINGING' && 'Ringing On-Duty Nurse (+1 555-911-CARE)...'}
            {callStatus === 'CONNECTED' && `Call Connected (00:${timer < 10 ? '0' + timer : timer})`}
          </h2>
          <p className="text-xs text-red-200/90 font-medium">
            Emergency Condition: <strong className="text-white uppercase">{patientData.emergencyType.replace(/_/g, ' ')}</strong>
          </p>
        </div>

        {/* Patient Vitals Quick Snapshot Box */}
        <div className="p-4 rounded-2xl bg-black/50 border border-red-500/40 text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Patient Name:</span>
            <span className="font-bold text-white">{patientData.name} ({patientData.room})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Heart Rate:</span>
            <span className={`font-bold ${patientData.heartRate > 120 ? 'text-red-400 font-extrabold' : 'text-slate-200'}`}>
              {patientData.heartRate} BPM {patientData.heartRate > 120 ? '(CRITICAL HIGH)' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">SpO₂ Oxygen:</span>
            <span className={`font-bold ${patientData.spo2 < 90 ? 'text-red-400 font-extrabold' : 'text-slate-200'}`}>
              {patientData.spo2}% {patientData.spo2 < 90 ? '(CRITICAL LOW)' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Body Temp:</span>
            <span className={`font-bold ${patientData.temperature > 38.0 ? 'text-amber-400 font-extrabold' : 'text-slate-200'}`}>
              {patientData.temperature}°C {patientData.temperature > 38.0 ? '(FEVER)' : ''}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> GPS Location:
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              {patientData.latitude.toFixed(4)}°, {patientData.longitude.toFixed(4)}°
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isAudioMuted 
                ? 'bg-slate-800 text-slate-400 border-slate-700' 
                : 'bg-red-900/60 text-white border-red-700 hover:bg-red-800'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse text-yellow-300" />}
            <span>{isAudioMuted ? 'Unmute Siren' : 'Mute Siren'}</span>
          </button>

          <button
            onClick={resolveEmergency}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call & Resolve Emergency</span>
          </button>

        </div>

      </div>
    </div>
  );
};
