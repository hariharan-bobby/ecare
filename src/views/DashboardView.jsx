import React from 'react';
import { usePatient } from '../context/PatientContext';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Radio, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Zap,
  Navigation
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardView = () => {
  const { patientData, vitalHistory, triggerEmergency } = usePatient();

  // Chart configuration for real-time telemetry
  const chartData = {
    labels: vitalHistory.map(h => h.time),
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        data: vitalHistory.map(h => h.heartRate),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3
      },
      {
        label: 'SpO₂ (%)',
        data: vitalHistory.map(h => h.spo2),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b' },
        min: 40,
        max: 150
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Emergency Siren Banner */}
      <EmergencyBanner />

      {/* Overview Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Patient Telemetry Dashboard</h1>
          <p className="text-xs text-slate-400">Live monitoring for <span className="text-indigo-400 font-semibold">{patientData.name}</span> — ESP32 Wokwi IoT Sensor Stream</p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            Last Sync: <strong>{patientData.timestamp}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live Stream
          </span>
        </div>
      </div>

      {/* Vital Metrics Grid (4 Main Vitals) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Heart Rate Card */}
        <div className={`p-5 rounded-2xl glass-panel glass-card-hover border transition-all ${
          patientData.heartRate > 120 || patientData.heartRate < 45
            ? 'border-rose-500/80 bg-rose-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Heart Rate</span>
            <div className={`p-2.5 rounded-xl ${
              patientData.heartRate > 120 || patientData.heartRate < 45 ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              <Heart className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-white font-heading">{patientData.heartRate} <span className="text-sm font-normal text-slate-400">BPM</span></div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              patientData.heartRate > 120 || patientData.heartRate < 45 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {patientData.heartRate > 120 ? 'HIGH' : patientData.heartRate < 45 ? 'LOW' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: 60 - 100 BPM</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* SpO2 Card */}
        <div className={`p-5 rounded-2xl glass-panel glass-card-hover border transition-all ${
          patientData.spo2 < 90
            ? 'border-sky-500/80 bg-sky-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Blood Oxygen (SpO₂)</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-white font-heading">{patientData.spo2}%</div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              patientData.spo2 < 90 
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {patientData.spo2 < 90 ? 'CRITICAL LOW' : 'OPTIMAL'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Target: &gt; 95%</span>
            <span className="text-sky-400">Pulse Oximeter</span>
          </div>
        </div>

        {/* Temperature Card */}
        <div className={`p-5 rounded-2xl glass-panel glass-card-hover border transition-all ${
          patientData.temperature > 38.0
            ? 'border-amber-500/80 bg-amber-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Body Temperature</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-3xl font-black text-white font-heading">{patientData.temperature}°C</div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              patientData.temperature > 38.0 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {patientData.temperature > 38.0 ? 'FEVER' : 'NORMAL'}
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sensor: DHT22</span>
            <span className="text-slate-400">Normal: 36.5 - 37.5°C</span>
          </div>
        </div>

        {/* Sensor Health & Status Card */}
        <div className="p-5 rounded-2xl glass-panel glass-card-hover border border-slate-800 hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Status</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className={`text-2xl font-black font-heading ${
              patientData.emergency ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {patientData.status}
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              99.8% Uptime
            </span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sensors: Active</span>
            <span className="text-emerald-400 font-medium">Firebase Connected</span>
          </div>
        </div>

      </div>

      {/* Secondary Status Cards (Fall Detection, SOS Button, GPS Location) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* MPU6050 Fall Detector Card */}
        <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
          patientData.fallDetected 
            ? 'bg-rose-950/40 border-rose-500 animate-pulse' 
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${patientData.fallDetected ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">MPU6050 Fall Sensor</div>
              <div className={`text-sm font-bold ${patientData.fallDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {patientData.fallDetected ? '🚨 FALL DETECTED!' : 'No Fall Detected'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => triggerEmergency('FALL_DETECTED')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Test
          </button>
        </div>

        {/* SOS Button Status Card */}
        <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
          patientData.sosPressed 
            ? 'bg-red-950/40 border-red-500 animate-pulse' 
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${patientData.sosPressed ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Physical SOS Button</div>
              <div className={`text-sm font-bold ${patientData.sosPressed ? 'text-red-400' : 'text-emerald-400'}`}>
                {patientData.sosPressed ? '🚨 SOS PRESSED!' : 'Button Standby'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => triggerEmergency('SOS_PRESSED')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Test
          </button>
        </div>

        {/* GPS Live Coordinates Card */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">Simulated GPS Tracker</div>
              <div className="text-xs font-mono font-bold text-white">
                {patientData.latitude.toFixed(5)}° N, {Math.abs(patientData.longitude).toFixed(5)}° W
              </div>
            </div>
          </div>
          <span className="px-2 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono">GPS Lock</span>
        </div>

      </div>

      {/* Real-time Telemetry Trend Graph */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Real-Time Vitals Stream</h3>
            <p className="text-xs text-slate-400">Live telemetry chart updating automatically every 3 seconds from ESP32</p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Heart Rate
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span> SpO₂
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
};
