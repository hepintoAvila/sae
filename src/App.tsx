import AppRoutes from '@/routes';
import { AuthProvider, NotificationProvider, ThemeProvider } from '@/common/context';
//import { configureFakeBackend } from './common';

// For Saas import Saas.scss
import './assets/scss/Saas.scss';
import { AulasProvider } from './common/context/useAulasContext';
 import { SessionProvider } from "./common/context/SessionContext";

// For Modern demo import Modern.scss
// import './assets/scss/Modern.scss';

// For Creative demo import Creative.scss
// import './assets/scss/Creative.scss';

//configureFakeBackend();

const App = () => {
	return (
		<ThemeProvider>
			
			<NotificationProvider>
				<AuthProvider>
					<SessionProvider warningTime={18} logoutTime={2}> 
					<AulasProvider>
					<AppRoutes />
					</AulasProvider>
					</SessionProvider>
				</AuthProvider>
			</NotificationProvider>
			
		</ThemeProvider>
	);
};

export default App;
