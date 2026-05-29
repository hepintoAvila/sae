
import ReportsDashboard from '@/components/ThemeCustomizer/ReportsDashboard';
import { lazy } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
 

const ProjectDashboard = lazy(() => import('./Project'));

export default function Dashboard() {
	return (
		<Routes>
			<Route path="/*" element={<Outlet />}>
				<Route path="reportes" element={<ReportsDashboard />} />
				<Route path="prestamos" element={<ProjectDashboard />} />
			</Route>
		</Routes>
	);
}
