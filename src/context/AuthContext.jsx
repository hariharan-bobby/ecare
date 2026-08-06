import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    // Default logged in user for immediate usability / demo
    const saved = localStorage.getItem('carepulse_user');
    return saved ? JSON.parse(saved) : {
      uid: 'user_caregiver_01',
      email: 'caregiver@carepulse.ai',
      displayName: 'Dr. Sarah Jenkins',
      role: 'Caregiver', // 'Admin' or 'Caregiver'
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Caregiver',
            role: user.email?.includes('admin') ? 'Admin' : 'Caregiver',
            avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
          };
          setCurrentUser(userData);
          localStorage.setItem('carepulse_user', JSON.stringify(userData));
        }
      });
      return unsubscribe;
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (auth && import.meta.env.VITE_FIREBASE_API_KEY) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Mock Login
        const role = email.toLowerCase().includes('admin') ? 'Admin' : 'Caregiver';
        const name = role === 'Admin' ? 'Admin Director Vance' : 'Nurse Sarah Jenkins';
        const userObj = {
          uid: 'user_' + Date.now(),
          email,
          displayName: name,
          role,
          avatar: role === 'Admin' 
            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' 
            : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
        };
        setCurrentUser(userObj);
        localStorage.setItem('carepulse_user', JSON.stringify(userObj));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth && import.meta.env.VITE_FIREBASE_API_KEY) {
        await signOut(auth);
      }
    } catch(e) {
      console.warn("Sign out local cleanup:", e);
    }
    setCurrentUser(null);
    localStorage.removeItem('carepulse_user');
  };

  const setRole = (role) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      localStorage.setItem('carepulse_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, setRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
