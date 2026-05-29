import { Route, Routes as ReactRoutes } from 'react-router-dom';
import ProtectedRoutes from './ProtectedRoutes';
import Account from '@/pages/account';
import ErrorPageNotFound from '@/pages/error/PageNotFound';

export default function AppRoutes() {
	return (
		<ReactRoutes>
			<Route path="account/*" element={<Account />} />
			<Route path="/*" element={<ProtectedRoutes />} />
			<Route path="*" element={<ErrorPageNotFound />} />
		</ReactRoutes>
	);
}
