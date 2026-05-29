import { useAulasContext } from '@/common';
import { AulasAlertService } from '@/pages/account/Login/AulasAlertService';
import { useEffect, useMemo, useRef } from 'react';
 

export function useVencimientoAlerts() {
  const { prestamos = [] } = useAulasContext();
  const alertados = useRef(new Set<string>());
  const alertService = AulasAlertService();
const userEmail = useMemo(() => {
  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return '';
    const data = JSON.parse(raw);
    return data?.email || data?.Email || data?.mail || '';
  } catch {
    return '';
  }
}, []);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      prestamos.forEach(async p => {
        if (String(p.email).toLowerCase() !== userEmail.toLowerCase()) return; 

        const end = new Date(String(p.end).replace(' ', 'T'));
        const diffMin = (end.getTime() - now.getTime()) / 60000;

        const key30 = `${p.id}-30`;
        if (diffMin > 29 && diffMin < 31 &&!alertados.current.has(key30)) {
          alertados.current.add(key30);
          if (Notification.permission === 'granted') {
            new Notification('⏰ Por vencer', { body: `${p.title}` });
          }
          await alertService.sendAlerta({
            to: String(p.email),
            tipo: 'preaviso',
            id_prestamo: String(p.id),
            titulo: p.title || '',
            fin: String(p.end),
          });
        }

        const key0 = `${p.id}-0`;
        if (diffMin < 0 && diffMin > -1 &&!alertados.current.has(key0)) {
          alertados.current.add(key0);
          await alertService.sendAlerta({
            to: String(p.email),
            tipo: 'vencido',
            id_prestamo: String(p.id),
            titulo: p.title || '',
            fin: String(p.end),
          });
        }
      });
    };

    if (Notification.permission!== 'granted') Notification.requestPermission();
    const id = setInterval(check, 60000);
    check();
    return () => clearInterval(id);
  }, [prestamos, alertService]);
}