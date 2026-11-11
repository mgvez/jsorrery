import { useEffect, useMemo, useState } from 'react';
import { useGuiState, useOrrery } from './OrreryContext';
import { Dropdown, Field, RangeField, TextField, onActivateKey } from './controls';
import ShareWidget from './ShareWidget';
import { parseDateInput } from '../core/settings';
import GeoCoord from '../utils/GeoCoord';

const PLAY_KEY = 'p';

function PlayButton() {
	const orrery = useOrrery();
	const playing = useGuiState(state => state.playing);

	//toggle animation with the keyboard, unless typing in a field
	useEffect(() => {
		const onKeyUp = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
			if (e.key.toLowerCase() === PLAY_KEY) orrery.togglePlaying();
		};
		window.addEventListener('keyup', onKeyUp);
		return () => window.removeEventListener('keyup', onKeyUp);
	}, [orrery]);

	return (
		<button
			type="button"
			id="start"
			className={playing ? 'fa fa-pause-circle' : 'fa fa-play-circle'}
			aria-label={playing ? 'Pause' : 'Play'}
			title={`${playing ? 'Pause' : 'Play'} (${PLAY_KEY})`}
			onClick={(e) => {
				e.stopPropagation();
				orrery.togglePlaying();
			}}
		>
			{' '}
		</button>
	);
}

function DateDisplay() {
	const date = useGuiState(state => state.date);
	return <div id="dateDisplay">{date ? date.toISOString() : ''}</div>;
}

function DateField() {
	const orrery = useOrrery();
	const date = useGuiState(state => state.date);
	return (
		<TextField
			aria-label="Date"
			value={date ? date.toISOString() : ''}
			onCommit={(value) => orrery.setDate(parseDateInput(value))}
		/>
	);
}

function GeolocField() {
	const orrery = useOrrery();
	const geoloc = useGuiState(state => state.geoloc);
	if (!geoloc) return null;
	return (
		<TextField
			aria-label="Latitude, longitude"
			value={new GeoCoord(geoloc.lat, geoloc.lng).getString()}
			onCommit={(value) => orrery.setGeoloc(new GeoCoord().setFromString(value))}
		/>
	);
}

interface GuiProps {
	/** a help panel is open */
	isHelpShown: boolean;
	onHelp: (target: string) => void;
}

/** the control panel on the left */
export default function Gui({ isHelpShown, onHelp }: GuiProps) {
	const orrery = useOrrery();
	const scenarios = useGuiState(state => state.scenarios);
	const scenario = useGuiState(state => state.scenario);
	const lookFrom = useGuiState(state => state.lookFrom);
	const lookAt = useGuiState(state => state.lookAt);
	const lookFromOptions = useGuiState(state => state.lookFromOptions);
	const lookAtOptions = useGuiState(state => state.lookAtOptions);
	const hasGeoloc = useGuiState(state => !!state.geoloc);
	const planetScale = useGuiState(state => state.planetScale);
	const planetScaleRange = useGuiState(state => state.planetScaleRange);
	const deltaT = useGuiState(state => state.deltaT);
	const deltaTRange = useGuiState(state => state.deltaTRange);
	const [collapsed, setCollapsed] = useState(false);
	const [isShareShown, setShareShown] = useState(false);

	const scenarioOptions = useMemo(() => scenarios.map(({ name, title }) => ({ value: name, label: title })), [scenarios]);
	const toggleCollapsed = () => setCollapsed(c => !c);

	const classNames = [collapsed && 'collapsed', isHelpShown && 'faded'].filter(Boolean).join(' ');

	return (
		<nav id="gui" className={classNames || undefined}>
			<div id="status">
				<div id="startCont" className="inputContainer"><PlayButton /></div>
				<DateDisplay />
			</div>

			<Field id="scenario" label="Scenario" help="helpScenario" onHelp={onHelp} isDropdown>
				<Dropdown id="scenario" options={scenarioOptions} value={scenario} onChange={name => orrery.loadScenario(name)} />
			</Field>

			<Field id="date" label="Date" help="helpDate" onHelp={onHelp}>
				<DateField />
			</Field>

			<Field id="lookFrom" label="Point of view" help="helpLookFrom" onHelp={onHelp} isDropdown>
				<Dropdown id="lookFrom" options={lookFromOptions} value={lookFrom} onChange={value => orrery.setLookFrom(value)} />
			</Field>

			{hasGeoloc && (
				<Field id="geoloc" label="Lat/Lng">
					<GeolocField />
				</Field>
			)}

			<Field id="lookAt" label="Look at" help="helpLookAt" onHelp={onHelp} isDropdown>
				<Dropdown id="lookAt" options={lookAtOptions} value={lookAt} onChange={value => orrery.setLookAt(value)} />
			</Field>

			<Field id="planetScale" label={<>Planet Scale <span className="valDisplay">{planetScale}</span>x</>} help="helpScale" onHelp={onHelp}>
				<RangeField aria-label="Planet scale" range={planetScaleRange} value={planetScale} onChange={value => orrery.setPlanetScale(value)} />
			</Field>

			{deltaTRange && (
				<Field id="deltaT" label="Animation speed" help="helpDeltaT" onHelp={onHelp}>
					<RangeField aria-label="Animation speed" range={deltaTRange} value={deltaT} onChange={value => orrery.setDeltaT(value)} />
				</Field>
			)}

			<label id="shareLabel" className="shown">
				<div id="shareCont" className="inputContainer">
					<button
						type="button"
						id="share"
						className="fa fa-share-alt"
						aria-label="Share"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setShareShown(shown => !shown);
						}}
					>
						{' '}
					</button>
				</div>
			</label>

			{isShareShown && <ShareWidget onClose={() => setShareShown(false)} />}

			<div
				id="navCollapse"
				className={`fa ${collapsed ? 'fa-angle-double-down' : 'fa-angle-double-up'}`}
				role="button"
				tabIndex={0}
				aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
				onClick={toggleCollapsed}
				onKeyDown={onActivateKey(toggleCollapsed)}
			/>
		</nav>
	);
}
