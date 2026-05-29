// src/common/context/SessionContext.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuthContext } from './useAuthContext';

// Define el tipo para el estado del contexto
interface SessionContextType {
  isWarningOpen: boolean;
  secondsLeft: number;
  resetTimers: () => void;
  handleExtend: () => Promise<void>;
  handleLogout: () => void;
}

// Crea el Context
const SessionContext = createContext<SessionContextType | undefined>(undefined);
 
// Crea el Provider
export const SessionProvider: React.FC<{
  children: React.ReactNode;
  warningTime?: number; // minutos antes de avisar
  logoutTime?: number; // minutos para cerrar
}> = ({ children, warningTime = 18, logoutTime = 2 }) => {


     const { isAuthenticated, clearCredentials } = useAuthContext(); // <-- usa auth real

    useEffect(() => {
    if (!isAuthenticated) {
      // si no está logueado, limpia todo y no muestres nada
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setOpen(false);
      return;
    }

    const events = ["click", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, resetTimers, true));
    resetTimers();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimers, true));
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated]); // <-- se activa/desactiva con login

  const [open, setOpen] = useState(false);
  const [seconds, setSeconds] = useState(logoutTime * 60);

  const warningTimer = useRef<number | null>(null);
  const logoutTimer = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const WARNING_TIME = warningTime * 60 * 1000;
  const LOGOUT_TIME = logoutTime * 60 * 1000;

  const resetTimers = () => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setOpen(false);
    setSeconds(logoutTime * 60);
    warningTimer.current = window.setTimeout(showWarning, WARNING_TIME);
  };

  const showWarning = () => {
    setOpen(true);
    setSeconds(logoutTime * 60);

    countdownRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          handleLogout();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    logoutTimer.current = window.setTimeout(handleLogout, LOGOUT_TIME);
  };

  const handleExtend = async () => {
    try {
      await fetch("/api/auth/keepalive", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Keepalive failed", e);
    }
    resetTimers();
  };

  const handleLogout = () => {
    clearCredentials();
    window.location.href = "/logout";
  };

  useEffect(() => {
    const events = ["click", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, resetTimers, true));
    resetTimers();

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimers, true));
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const contextValue: SessionContextType = {
    isWarningOpen: open,
    secondsLeft: seconds,
    resetTimers,
    handleExtend,
    handleLogout,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <h3 className="text-xl font-bold text-[#006633] mb-2">
              La sesión caducará pronto
            </h3>
            <p className="text-gray-600 text-sm mb-1">
              Por razones de seguridad, las sesiones de usuario caducan después de 20 minutos de inactividad.
            </p>
            <p className="text-gray-700 font-medium mb-4">
              Su sesión caducará en <span className="text-[#006633] font-bold">{seconds}</span> segundos.
            </p>
            <p className="text-gray-600 mb-5">¿Le gustaría prolongarla o cerrar la sesión?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleExtend}
                className="bg-[#00b894] hover:bg-[#009874] text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                Prolongar sesión
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </SessionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useSessionContext = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSessionContext debe usarse dentro de SessionProvider');
  return ctx;
};