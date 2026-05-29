import { ReactNode, Suspense} from 'react';
import { useAccountLayout } from '@/components/BGCircles';
// images
import Calendar from '@/components/Calendar';
import TopBarPublic from '@/layouts/Topbar/TopBarPublic';
import { PageLoader } from '@/components';
import Footer from '@/layouts/Footer';

 
type AccountLayoutProps = {
	children?: ReactNode;
};

const AccountWrapper2 = ({ children}: AccountLayoutProps) => {
	useAccountLayout();
	return (
		<><Suspense fallback={<PageLoader />}><TopBarPublic children={children} /></Suspense>
		<div className="auth-fluid">
			{/* ✅ PANEL IZQUIERDO - SOLO SE MUESTRA AL HACER CLIC */}
			<div className="auth-fluid-right text-center container-fluid">
				<Suspense fallback={<PageLoader />}>
						<Calendar />
					</Suspense>
					<Suspense fallback={<PageLoader />}>
						<Footer />
					</Suspense>
			</div>
		</div>
		</>
	);
};

export default AccountWrapper2;