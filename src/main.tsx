import App from './App';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'regenerator-runtime/runtime';
const container = document.getElementById('hyper');
if (container) {
	const root = createRoot(container);
	root.render(
		<HashRouter basename={import.meta.env.VITE_PUBLIC_URL || ''}>
			<App />
		</HashRouter>
	);
}