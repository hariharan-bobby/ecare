import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { EmergencyView } from './views/EmergencyView';
import { HistoryView } from './views/HistoryView';
import { AIAssistantView } from './views/AIAssistantView';
import { MedicationView } from './views/MedicationView';
import { WokwiSetupView } from './views/WokwiSetupView';
import { LoginView } from './views/LoginView';

const ProtectedLayout = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <PatientProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/" element={<ProtectedLayout><DashboardView /></ProtectedLayout>} />
            <Route path="/emergency" element={<ProtectedLayout><EmergencyView /></ProtectedLayout>} />
            <Route path="/history" element={<ProtectedLayout><HistoryView /></ProtectedLayout>} />
            <Route path="/ai-assistant" element={<ProtectedLayout><AIAssistantView /></ProtectedLayout>} />
            <Route path="/medications" element={<ProtectedLayout><MedicationView /></ProtectedLayout>} />
            <Route path="/wokwi-setup" element={<ProtectedLayout><WokwiSetupView /></ProtectedLayout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PatientProvider>
    </AuthProvider>
  );
}

export default App;
