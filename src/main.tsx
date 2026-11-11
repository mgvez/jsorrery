import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/jsorrery.css';
import Orrery from './core/Orrery';
import { getInitialSettings } from './core/settings';
import { OrreryContext } from './ui/OrreryContext';
import App from './ui/App';

const orrery = new Orrery(getInitialSettings());

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<OrreryContext.Provider value={orrery}>
			<App />
		</OrreryContext.Provider>
	</StrictMode>,
);
