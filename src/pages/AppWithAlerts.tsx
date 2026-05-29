import { useVencimientoAlerts } from '@/components/Calendar/hooks/useVencimientoAlerts';
import ReportsDashboard from '@/components/ThemeCustomizer/ReportsDashboard';
import { Routes, Route } from 'react-router-dom';


export default function AppWithAlerts() {
  // ✅ Ahora sí está dentro del Provider
  useVencimientoAlerts();

  return (
    <Routes>
      <Route path="/dashboard/reportes" element={<ReportsDashboard />} />
      {/* tus demás rutas */}
    </Routes>
  );
}