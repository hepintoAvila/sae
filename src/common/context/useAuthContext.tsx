// src/common/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';

interface Credentials {
  login: string;
  password: string;
  //token?: string; // opcional
}

interface AuthContextProps {
  children: React.ReactNode;
}

interface AuthContextValue {
  credentials: Credentials | null;
  setCredentials: (credentials: Credentials | null) => void;
  clearCredentials: () => void;
  isAuthenticated: boolean; // <-- NUEVO
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AuthProvider = ({ children }: AuthContextProps) => {
  const [credentials, setCredentials] = useState<Credentials | null>(() => {
    // carga inicial desde localStorage (como ya haces en CalendarApp)
    const saved = localStorage.getItem('userData');
    return saved? JSON.parse(saved) : null;
  });

  const clearCredentials = () => {
    setCredentials(null);
    localStorage.removeItem('userData');
  };

  // guarda automáticamente cuando cambie
  useEffect(() => {
    if (credentials) {
      localStorage.setItem('userData', JSON.stringify(credentials));
    }
  }, [credentials]);

  const isAuthenticated =!!credentials; // <-- aquí está la magia

  return (
    <AuthContext.Provider value={{ credentials, setCredentials, clearCredentials, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// hook helper (igual que tu useAulasContext)
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return ctx;
};

export { AuthContext, AuthProvider };