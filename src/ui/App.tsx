import { useCallback, useEffect, useRef, useState } from 'react';
import { useGuiState, useOrrery } from './OrreryContext';
import Gui from './Gui';
import HelpPanels, { isHelpPanel } from './HelpPanels';
import { HelpButton } from './controls';

/** the element in which the 3d scene is rendered */
function Stage() {
	const orrery = useOrrery();
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		orrery.attach(ref.current!);
		return () => orrery.detach();
	}, [orrery]);
	return <div id="jsorrery-stage" ref={ref} />;
}

function Preloader() {
	const loading = useGuiState(state => state.loading);
	const error = useGuiState(state => state.error);
	return (
		<div className={`preload${loading || error ? '' : ' hidden'}`} aria-busy={loading}>
			{loading && <div className="orbit"><div className="planet" /></div>}
			<div className="title">
				<h1>jsorrery</h1>
				<h2>solar system</h2>
				{error && <h3 role="alert">{error}</h3>}
			</div>
		</div>
	);
}

export default function App() {
	const orrery = useOrrery();
	const [helpShown, setHelpShown] = useState<string | null>(() => {
		const { showHelp } = orrery.settings;
		return isHelpPanel(showHelp) ? showHelp : null;
	});
	const toggleHelp = useCallback((target: string) => setHelpShown(current => (current === target ? null : target)), []);
	const closeHelp = useCallback(() => setHelpShown(null), []);

	return (
		<>
			<Stage />
			<Gui isHelpShown={!!helpShown} onHelp={toggleHelp} />
			<HelpPanels shown={helpShown} onClose={closeHelp} />
			<Preloader />
			<HelpButton id="credits" target="helpCredits" onToggle={toggleHelp}>credits</HelpButton>
		</>
	);
}
