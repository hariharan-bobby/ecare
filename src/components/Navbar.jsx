import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { 
  Heart, 
  Bell, 
  Volume2, 
  VolumeX, 
  Wifi, 
  AlertTriangle, 
  User, 
  ShieldAlert, 
  LogOut,
  Sparkles,
  Activity
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout, setRole } = useAuth();
  const { patientData, isAudioMuted, setIsAudioMuted, triggerEmergency } = usePatient();
  const [showSimMenu, setShowSimMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        
        {/* Brand logo & tagline */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-900/30">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white font-heading tracking-tight">CarePulse</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Voice Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">IoT Sensor Telemetry & Emergency Command Center</p>
          </div>
        </div>

        {/* Action Controls & User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Audio siren toggle button */}
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-2.5 rounded-xl border transition-all flex items-center space-x-1.5 text-xs font-medium ${
              isAudioMuted 
                ? 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title={isAudioMuted ? "Unmute Alarm Siren" : "Mute Alarm Siren"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />}
            <span className="hidden md:inline">{isAudioMuted ? "Siren Muted" : "Siren Active"}</span>
          </button>

          {/* Quick Simulation Trigger Dropdown for testing */}
          <div className="relative">
            <button
              onClick={() => setShowSimMenu(!showSimMenu)}
              className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-medium flex items-center space-x-1.5 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Simulate Wokwi Alert</span>
            </button>

            {showSimMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                  Trigger Wokwi Sensor Emergency
                </div>
                <button
                  onClick={() => { triggerEmergency('SOS_PRESSED'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center space-x-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>SOS Panic Button</span>
                </button>
                <button
                  onClick={() => { triggerEmergency('FALL_DETECTED'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>MPU6050 Fall Trigger</span>
                </button>
                <button
                  onClick={() => { triggerEmergency('HIGH_HEART_RATE'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center space-x-2"
                >
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>High Heart Rate (&gt;120 BPM)</span>
                </button>
                <button
                  onClick={() => { triggerEmergency('LOW_SPO2'); setShowSimMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-sky-400 hover:bg-sky-500/10 rounded-lg flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4 text-sky-400" />
                  <span>Low SpO₂ (&lt;90%)</span>
                </button>
              </div>
            )}
          </div>

          {/* Wokwi IoT Online indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">ESP32 Wokwi: <span className="text-emerald-400 font-medium">Online</span></span>
          </div>

          {/* User profile dropdown & role toggle */}
          {currentUser && (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.displayName} 
                className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
              />
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight">{currentUser.displayName}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">{currentUser.role}</span>
                  <button 
                    onClick={() => setRole(currentUser.role === 'Admin' ? 'Caregiver' : 'Admin')}
                    className="text-[10px] text-indigo-400 hover:underline"
                  >
                    (Switch to {currentUser.role === 'Admin' ? 'Caregiver' : 'Admin'})
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
