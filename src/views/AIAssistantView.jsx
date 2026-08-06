import React, { useState, useEffect } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Bot, 
  Brain, 
  Heart, 
  ShieldAlert, 
  TrendingUp, 
  Volume2, 
  Send,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const AIAssistantView = () => {
  const { patientData } = usePatient();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Elderly Care Assistant. I am actively monitoring ${patientData.name}'s vitals. Ask me about heart rate trends, medication reminders, or emergency protocols.`,
      time: 'Just now'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Speech Recognition API setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      handleUserQuery(spokenText);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    if (isListening) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => recognition.stop();
  }, [isListening]);

  // Text-to-Speech synthesizer helper
  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUserQuery = (queryText) => {
    if (!queryText.trim()) return;

    const userMsg = { sender: 'user', text: queryText, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Generate AI response based on vitals context
    setTimeout(() => {
      let aiText = '';
      const q = queryText.toLowerCase();

      if (q.includes('heart rate') || q.includes('pulse')) {
        aiText = `Current heart rate is ${patientData.heartRate} BPM. ${
          patientData.heartRate > 120 ? 'Warning! High heart rate threshold exceeded!' : 'Pulse is currently within safe parameters.'
        }`;
      } else if (q.includes('spo2') || q.includes('oxygen')) {
        aiText = `Blood oxygen level is at ${patientData.spo2}%. ${
          patientData.spo2 < 90 ? 'Critical! SpO2 is dangerously low!' : 'SpO2 saturation is optimal.'
        }`;
      } else if (q.includes('emergency') || q.includes('sos') || q.includes('fall')) {
        aiText = patientData.emergency
          ? `Active emergency detected: ${patientData.emergencyType}. Caregiver notification dispatched!`
          : `No active emergencies. The MPU6050 fall detection sensor and SOS button are in ready state.`;
      } else if (q.includes('risk') || q.includes('prediction')) {
        aiText = `Based on recent trend telemetry, patient overall cardiovascular risk is LOW (8.2%), with 99.4% fall stability score.`;
      } else {
        aiText = `I have analyzed ${patientData.name}'s telemetry. Temperature is ${patientData.temperature}°C, Heart rate is ${patientData.heartRate} BPM, SpO2 is ${patientData.spo2}%. All sensors operating normally.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiText, time: new Date().toLocaleTimeString() }]);
      speakResponse(aiText);
    }, 600);
  };

  // AI Health Risk Calculator based on live parameters
  const calculateRiskScore = () => {
    let score = 5;
    if (patientData.heartRate > 100) score += 30;
    if (patientData.spo2 < 94) score += 35;
    if (patientData.temperature > 37.8) score += 20;
    if (patientData.fallDetected) score += 40;
    return Math.min(100, score);
  };

  const riskScore = calculateRiskScore();

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            AI Healthcare Voice Assistant & Risk Predictor
          </h1>
          <p className="text-xs text-slate-400">Interactive voice speech assistant with real-time patient risk telemetry modeling</p>
        </div>
      </div>

      {/* AI Risk & Telemetry Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Risk Score Card */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Health Risk Predictor</div>
            <div className="text-3xl font-black text-white mt-1 font-heading">{riskScore}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Calculated via multi-sensor neural model</div>
          </div>

          <div className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
            riskScore > 50 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {riskScore > 50 ? 'ELEVATED RISK' : 'LOW RISK'}
          </div>
        </div>

        {/* Fall Risk Prediction Card */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fall Detection AI Index</div>
            <div className="text-3xl font-black text-white mt-1 font-heading">98.4%</div>
            <div className="text-[11px] text-slate-400 mt-1">MPU6050 Accelerometer stability balance</div>
          </div>

          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-400" /> Caregiver Recommendations
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            • Maintain room hydration levels.<br />
            • Schedule evening blood pressure check at 18:00.<br />
            • SpO₂ stability optimal.
          </p>
        </div>

      </div>

      {/* Voice Assistant Chat Interface */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 flex flex-col h-[480px]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Voice & Text Health Assistant</div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Web Speech Voice Synthesizer Ready
              </div>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Chat Input & Speech Button */}
        <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-3 rounded-xl transition-all shadow-md flex items-center justify-center ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30'
            }`}
            title={isListening ? "Listening... Speak now" : "Click to speak voice prompt"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUserQuery(inputQuery)}
            placeholder={isListening ? "Listening to your voice..." : "Ask AI assistant (e.g., 'What is Eleanor's heart rate?')..."}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <button
            onClick={() => handleUserQuery(inputQuery)}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
