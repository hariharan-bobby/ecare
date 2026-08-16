import React, { useState } from 'react';
import { Cpu, ExternalLink, Copy, Check, Radio, Wifi, Zap, Code, Play } from 'lucide-react';

export const WokwiSetupView = () => {
  const [copied, setCopied] = useState(false);
  const wokwiProjectUrl = "https://wokwi.com/projects/471587035595461633";

  const testCurlCommand = `curl -X POST https://elderly-care-assistant-default-rtdb.firebaseio.com/patients/patient001.json \\
  -H "Content-Type: application/json" \\
  -d '{"heartRate": 135, "spo2": 88, "temperature": 38.9, "fallDetected": true, "sosPressed": true, "emergency": true, "emergencyType": "FALL_DETECTED", "timestamp": "12:45:00 PM"}'`;

  const copyCommand = () => {
    navigator.clipboard.writeText(testCurlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-400" /> ESP32 Wokwi Live Connected Project
          </h1>
          <p className="text-xs text-slate-400">
            Connected to Wokwi Project ID: <code className="text-emerald-400 font-mono">471587035595461633</code>
          </p>
        </div>

        <a
          href={wokwiProjectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all self-start sm:self-auto"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Project #471587035595461633 in Wokwi</span>
        </a>
      </div>

      {/* Embedded Live Wokwi Simulation iFrame */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-400 animate-pulse" /> Live Embedded Wokwi Simulator Window
          </h3>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/30 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 animate-pulse" /> Connected to Wokwi Simulator
          </span>
        </div>

        <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative">
          <iframe
            src={`${wokwiProjectUrl}?embed=1`}
            title="Wokwi ESP32 Live Simulation"
            className="w-full h-full border-0"
            allow="autoplay"
          ></iframe>
        </div>
      </div>

      {/* Instructions & REST API Trigger Command */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" /> How Your Wokwi Project Syncs to the Dashboard
            </h3>

            <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-white">Open Project Code:</strong> Open your Wokwi project at <a href={wokwiProjectUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline font-semibold">{wokwiProjectUrl}</a>.
              </li>
              <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-white">Check Firmware Code:</strong> Ensure the sketch tab contains the ESP32 code from <code className="text-emerald-400 font-mono">wokwi/esp32_firmware.ino</code>.
              </li>
              <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-white">Check Schematic Connections:</strong> Ensure the components match <code className="text-emerald-400 font-mono">wokwi/diagram.json</code>.
              </li>
              <li className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <strong className="text-white">Run & Trigger Emergencies:</strong> Press the green Play button inside the embedded simulator frame above or in Wokwi. Press the red SOS button or slide the heart rate potentiometer to see emergency alerts update live on the dashboard!
              </li>
            </ol>
          </div>

          {/* Test REST API Trigger Command */}
          <div className="p-5 rounded-2xl glass-panel border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" /> Test Firebase REST Telemetry via cURL
              </h3>
              <button
                onClick={copyCommand}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {testCurlCommand}
            </pre>
          </div>

        </div>

        {/* Wokwi Hardware Pinout Diagram Summary */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" /> Wokwi Pinout Mapping
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">OLED SSD1306 (I2C):</span>
                <span className="text-emerald-400">GPIO 21 (SDA), GPIO 22 (SCL)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">DHT22 Temp Sensor:</span>
                <span className="text-emerald-400">GPIO 4</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">MPU6050 Accelerometer:</span>
                <span className="text-emerald-400">GPIO 21 (SDA), GPIO 22 (SCL)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">SOS Push Button:</span>
                <span className="text-emerald-400">GPIO 14 (Pull-Up)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Active Piezo Buzzer:</span>
                <span className="text-emerald-400">GPIO 25</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Red Alert LED:</span>
                <span className="text-rose-400">GPIO 12</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">Green Normal LED:</span>
                <span className="text-emerald-400">GPIO 13</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

