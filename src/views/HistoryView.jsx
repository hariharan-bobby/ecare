import React, { useState } from 'react';
import { usePatient } from '../context/PatientContext';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  ShieldAlert, 
  FileText,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const HistoryView = () => {
  const { alerts, acknowledgeAlert } = usePatient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'UNACKNOWLEDGED') return matchesSearch && !alert.acknowledged;
    if (filterType === 'CRITICAL') return matchesSearch && (alert.severity === 'High' || alert.severity === 'CRITICAL');
    return matchesSearch;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CarePulse AI — Elderly Patient Emergency Logs Report', 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated Date: ${new Date().toLocaleString()} | Total Alerts: ${filteredAlerts.length}`, 14, 28);

    const tableColumn = ["Alert ID", "Timestamp", "Emergency Type", "Message", "Vitals Snapshot", "Status"];
    const tableRows = filteredAlerts.map(alert => [
      alert.id,
      alert.timestamp,
      alert.type.replace(/_/g, ' '),
      alert.message,
      `HR: ${alert.vitalsSnapshot.heartRate} BPM, SpO2: ${alert.vitalsSnapshot.spo2}%, Temp: ${alert.vitalsSnapshot.temp}°C`,
      alert.acknowledged ? 'Acknowledged' : 'Pending Action'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 34,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`CarePulse_Emergency_History_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" /> Emergency History & Audit Logs
          </h1>
          <p className="text-xs text-slate-400">Searchable historical telemetry events, SOS triggers, and caregiver audit log</p>
        </div>

        <button
          onClick={exportPDF}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Official PDF Report</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search alerts, types, or messages..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <span className="text-xs text-slate-400 hidden sm:block">Filter:</span>
          
          {['ALL', 'UNACKNOWLEDGED', 'CRITICAL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === f 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

      </div>

      {/* History Table */}
      <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <th className="py-3.5 px-4">Alert ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Emergency Event</th>
                <th className="py-3.5 px-4">Details</th>
                <th className="py-3.5 px-4">Vitals Snapshot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No emergency logs match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{alert.id}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        alert.type === 'SOS_PRESSED' || alert.type === 'FALL_DETECTED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {alert.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{alert.message}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      HR: {alert.vitalsSnapshot.heartRate} | SpO₂: {alert.vitalsSnapshot.spo2}% | Temp: {alert.vitalsSnapshot.temp}°C
                    </td>
                    <td className="py-3.5 px-4">
                      {alert.acknowledged ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
