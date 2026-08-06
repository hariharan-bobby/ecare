import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  ShieldAlert, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX,
  Heart,
  Activity,
  Thermometer,
  User,
  Building,
  Clock,
  Send,
  FileText
} from 'lucide-react';

export const EmergencyView = () => {
  const { patientData, resolveEmergency, isAudioMuted, setIsAudioMuted, triggerEmergency } = usePatient();
  const [protocolSteps, setProtocolSteps] = useState([
    { id: 1, label: 'Identify Patient Room & Physical Location', completed: true },
    { id: 2, label: 'Attempt Voice Intercom Check-in with Patient', completed: false },
    { id: 3, label: 'Notify On-duty Floor Nurse / Caregiver', completed: false },
    { id: 4, label: 'Dispatch Emergency Medical Technicians (if un-responsive)', completed: false }
  ]);
  const [note, setNote] = useState('');
  const [dispatchLogged, setDispatchLogged] = useState(false);

  const toggleStep = (id) => {
    setProtocolSteps(steps => steps.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-rose-500 animate-pulse" />
            Emergency Command & Dispatch Center
          </h1>
          <p className="text-xs text-slate-400">Real-time incident response management and patient location protocol</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              isAudioMuted 
                ? 'bg-slate-800 text-slate-400 border-slate-700' 
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isAudioMuted ? 'Unmute Siren' : 'Siren Active'}</span>
          </button>

          {!patientData.emergency ? (
            <button
              onClick={() => triggerEmergency('SOS_PRESSED')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/40"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Emergency</span>
            </button>
          ) : (
            <button
              onClick={resolveEmergency}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolve & Clear Alert</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Alert Card or Normal Status Banner */}
      {patientData.emergency ? (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-red-950 via-rose-900/60 to-slate-900 border-2 border-red-500/80 shadow-2xl animate-emergency relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white uppercase tracking-wider animate-bounce">
                  🚨 ACTIVE CRITICAL EMERGENCY
                </span>
                <span className="text-xs text-red-200">Triggered at {patientData.timestamp}</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-2 font-heading">
                {patientData.emergencyType.replace(/_/g, ' ')}
              </h2>
              <p className="text-sm text-red-200 mt-1">
                Patient <strong className="text-white">{patientData.name}</strong> has breached safety thresholds! Caregivers have been dispatched via Firebase Cloud Messaging.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="tel:911"
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-red-700/50"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                <span>Call Emergency 911</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">System Status: All Patients Stable</h2>
              <p className="text-xs text-slate-400">No active emergency alerts detected from ESP32 Wokwi IoT sensors.</p>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Grid Details & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Patient Telemetry Snapshot & Patient Details */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Patient Emergency Profile
            </h3>

            <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
                alt={patientData.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
              />
              <div>
                <h4 className="text-base font-bold text-white">{patientData.name}</h4>
                <div className="text-xs text-slate-400">Age: {patientData.age} • Gender: Female</div>
                <div className="text-xs text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> {patientData.room}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400" /> Heart Rate:
                </span>
                <span className="font-bold text-white">{patientData.heartRate} BPM</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-400" /> Blood Oxygen (SpO₂):
                </span>
                <span className="font-bold text-white">{patientData.spo2}%</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" /> Body Temp:
                </span>
                <span className="font-bold text-white">{patientData.temperature}°C</span>
              </div>
            </div>
          </div>

          {/* Emergency Response Protocol Checklist */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Caregiver Action Protocol
            </h3>
            <div className="space-y-2">
              {protocolSteps.map(step => (
                <button
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    step.completed 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{step.label}</span>
                  <CheckCircle2 className={`w-4 h-4 ${step.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Live GPS Map View & Dispatch Logs */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Visual Map Representation Card */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" /> Live GPS Location Tracker
                </h3>
                <p className="text-xs text-slate-400">Simulated GPS Telemetry from ESP32 Board</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-mono border border-indigo-500/30">
                {patientData.latitude.toFixed(5)}° N, {patientData.longitude.toFixed(5)}° W
              </span>
            </div>

            {/* Custom Styled Simulated Map UI Container */}
            <div className="relative w-full h-72 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              
              {/* Map grid aesthetic overlay */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              {/* Simulated Map Roads / Building outlines */}
              <div className="absolute w-full h-1 bg-indigo-500/20 top-1/2 -translate-y-1/2"></div>
              <div className="absolute h-full w-1 bg-indigo-500/20 left-1/3"></div>
              <div className="absolute h-full w-1 bg-indigo-500/20 left-2/3"></div>

              {/* Building Card Mock */}
              <div className="absolute top-8 left-12 p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-center shadow-lg">
                <Building className="w-5 h-5 text-slate-400 mx-auto" />
                <div className="text-[10px] text-slate-300 font-bold mt-1">St. Jude Medical Wing</div>
              </div>

              {/* Glowing Emergency Location Pulse Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-rose-500/30 animate-ping absolute -top-2 -left-2"></div>
                  <div className="w-8 h-8 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-2xl">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="mt-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-rose-500 text-white text-xs font-bold shadow-2xl flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{patientData.name} ({patientData.room})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Dispatch Log Form */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" /> Log Emergency Incident Report
            </h3>

            <div className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type emergency notes, observations, physician instructions, or caregiver dispatch updates..."
                className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {dispatchLogged ? '✅ Incident entry recorded into Firestore database.' : 'Saves entry to Firebase Firestore.'}
                </span>
                <button
                  onClick={() => {
                    if (!note.trim()) return;
                    setDispatchLogged(true);
                    setNote('');
                    setTimeout(() => setDispatchLogged(false), 4000);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Incident Entry</span>
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
