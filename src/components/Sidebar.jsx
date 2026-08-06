import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePatient } from '../context/PatientContext';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  History, 
  Mic, 
  Pill, 
  Cpu, 
  ChevronRight,
  HeartPulse
} from 'lucide-react';

export const Sidebar = () => {
  const { patientData } = usePatient();

  const navItems = [
    {
      label: 'Live Dashboard',
      path: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Emergency Panel',
      path: '/emergency',
      icon: ShieldAlert,
      badge: patientData.emergency ? 'ACTIVE' : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse'
    },
    {
      label: 'History & Logs',
      path: '/history',
      icon: History,
      badge: null
    },
    {
      label: 'AI Voice Assistant',
      path: '/ai-assistant',
      icon: Mic,
      badge: 'AI Powered',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
    },
    {
      label: 'Medications',
      path: '/medications',
      icon: Pill,
      badge: null
    },
    {
      label: 'ESP32 Wokwi Config',
      path: '/wokwi-setup',
      icon: Cpu,
      badge: 'IoT Code',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900/70 border-r border-slate-800/80 flex flex-col justify-between py-6 px-3 shrink-0 hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        
        {/* Patient Selection Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
                alt={patientData.name}
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/40"
              />
              <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                patientData.emergency ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}></span>
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{patientData.name}</div>
              <div className="text-xs text-slate-400">Age {patientData.age} • {patientData.room}</div>
            </div>
          </div>
          
          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Sensor Health:
            </span>
            <span className="font-semibold text-emerald-400">{patientData.sensorHealth}</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Navigation Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-900/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                      }`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {!item.badge && isActive && (
                      <ChevronRight className="w-4 h-4 text-white/70" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Info */}
      <div className="px-3 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex justify-between">
          <span>Firebase Sync:</span>
          <span className="text-slate-300 font-medium">Connected</span>
        </div>
        <div className="flex justify-between">
          <span>REST API:</span>
          <span className="text-emerald-400 font-medium">Active (200 OK)</span>
        </div>
      </div>
    </aside>
  );
};
