import React, { useState } from 'react';
import { Pill, Plus, CheckCircle, Clock, Bell, Trash2, Calendar, AlertCircle } from 'lucide-react';

export const MedicationView = () => {
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Lisinopril (Blood Pressure)',
      dosage: '10mg',
      time: '08:00 AM',
      taken: true,
      instructions: 'Take with full glass of water after breakfast'
    },
    {
      id: 2,
      name: 'Metformin (Blood Sugar)',
      dosage: '500mg',
      time: '01:00 PM',
      taken: true,
      instructions: 'Take during lunch meal'
    },
    {
      id: 3,
      name: 'Atorvastatin (Cholesterol)',
      dosage: '20mg',
      time: '08:00 PM',
      taken: false,
      instructions: 'Take before bedtime'
    }
  ]);

  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleTaken = (id) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const addMedication = () => {
    if (!newName || !newDosage || !newTime) return;
    const newMed = {
      id: Date.now(),
      name: newName,
      dosage: newDosage,
      time: newTime,
      taken: false,
      instructions: newInstructions || 'Follow physician prescription'
    };
    setMedications([...medications, newMed]);
    setNewName('');
    setNewDosage('');
    setNewTime('');
    setNewInstructions('');
    setShowAddModal(false);
  };

  const deleteMed = (id) => {
    setMedications(meds => meds.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Pill className="w-6 h-6 text-indigo-400" /> AI Medication Schedule Manager
          </h1>
          <p className="text-xs text-slate-400">Automated daily medication alerts and adherence tracking</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Medication Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Scheduled Today</div>
            <div className="text-2xl font-black text-white mt-1 font-heading">{medications.length} Prescriptions</div>
          </div>
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Adherence Completed</div>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-heading">
              {medications.filter(m => m.taken).length} / {medications.length}
            </div>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Pending Doses</div>
            <div className="text-2xl font-black text-amber-400 mt-1 font-heading">
              {medications.filter(m => !m.taken).length} Doses
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Medication List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map(med => (
          <div
            key={med.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              med.taken 
                ? 'bg-slate-900/60 border-slate-800 opacity-80' 
                : 'glass-panel border-indigo-500/40 shadow-lg'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${med.taken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{med.name}</h3>
                    <span className="text-xs text-indigo-400 font-semibold">{med.dosage}</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> {med.time}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                {med.instructions}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => toggleTaken(med.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  med.taken 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>{med.taken ? 'Taken' : 'Mark as Taken'}</span>
              </button>

              <button
                onClick={() => deleteMed(med.id)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove Prescription"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-heading">Add New Prescription</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Lisinopril"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dosage</label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={e => setNewDosage(e.target.value)}
                  placeholder="e.g. 10mg"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Schedule Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  placeholder="e.g. 08:00 AM"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Caregiver Instructions</label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={e => setNewInstructions(e.target.value)}
                  placeholder="e.g. Take with food"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={addMedication}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
