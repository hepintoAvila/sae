import DefaultLayout from '@/layouts/Default';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const PageNotFound = lazy(() => import('./PageNotFound'));

const ErrorPages = () => {
	return (
		<Routes>
			<Route path="/*" element={<DefaultLayout />}>
				<Route path="404" element={<PageNotFound />} />
			</Route>
		</Routes>
	);
};

export default ErrorPages;
