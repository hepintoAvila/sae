import {  ThemeSettings, useThemeContext } from '@/common';
import { lazy } from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import VerticalLayout from '@/layouts/Vertical';
import HorizontalLayout from '@/layouts/Horizontal';
import Root from './Root';
import useAuth from '@/hooks/useAuth';
import LoadingSpinner from '@/components/PageLoader';
/**
 * routes import
 */
const Dashboard = lazy(() => import('../pages/dashboard'));

export default function ProtectedRoutes() {
	const { settings } = useThemeContext();
	const Layout =
		settings.layout.type == ThemeSettings.layout.type.vertical
			? VerticalLayout
			: HorizontalLayout;

  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }
	return (
		<ReactRoutes>
			<Route path="/*" element={<Layout />}>
				<Route index element={<Root />} />
				<Route path="dashboard/*" element={<Dashboard />} />
			</Route>
		</ReactRoutes>
	)
}
