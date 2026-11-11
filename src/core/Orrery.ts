import Universe from './Universe';
import { getScenario, getScenarioList } from '../scenario/Loader';
import { createStore } from '../state/store';
import { initialGuiState, type GuiState } from '../state/types';
import type { GuiSettings } from '../scenario/types';
import type { GeoLoc } from '../utils/GeoCoord';

function errorMessage(e: unknown) {
	return e instanceof Error ? e.message : String(e);
}

/**
 The application's controller: loads scenarios in a stage element, and exposes the actions of the GUI.
 The GUI reads the state from `store`; the active universe writes to it.
 */
export default class Orrery {
	store = createStore<GuiState>(initialGuiState);
	settings: GuiSettings;
	universe: Universe | null = null;
	stage: HTMLElement | null = null;
	private loadToken = 0;
	private resizeObserver?: ResizeObserver;
	private startTimer?: ReturnType<typeof setTimeout>;

	/** @param settings initial settings, from the page and the query string */
	constructor(settings: GuiSettings) {
		this.settings = settings;
		this.store.setState({
			scenarios: getScenarioList().map(({ name, title, help }) => ({ name, title, help })),
		});
	}

	/** starts the app in the stage element */
	attach(stage: HTMLElement) {
		this.stage = stage;
		this.resizeObserver = new ResizeObserver(() => {
			if (this.universe) this.universe.resize(stage.offsetWidth, stage.offsetHeight);
		});
		this.resizeObserver.observe(stage);

		if (!window.WebGLRenderingContext) {
			this.store.setState({ loading: false, error: 'Your browser does not support WebGL. Please visit http://get.webgl.org/' });
			return;
		}

		const scenarios = getScenarioList();
		const defaultScenario = scenarios.find(scenario => scenario.name === this.settings.scenario) || scenarios[0];
		//deferred, so that an immediate detach (React's StrictMode remounts in development) doesn't build the scene twice
		this.startTimer = setTimeout(() => this.loadScenario(defaultScenario.name, this.settings), 0);
	}

	detach() {
		clearTimeout(this.startTimer);
		this.loadToken++;
		this.resizeObserver?.disconnect();
		this.killUniverse();
		this.stage = null;
	}

	private killUniverse() {
		if (this.universe) this.universe.kill();
		this.universe = null;
	}

	/**
	 Loads a scenario. Settings are only given for the first scenario (from the page); when the user changes scenario,
	 each scenario starts with its own defaults.
	 */
	async loadScenario(name: string, settings?: GuiSettings) {
		if (this.universe && this.universe.name === name) return;
		const scenario = getScenario(name);
		const stage = this.stage;
		if (!scenario || !stage) return;

		const token = ++this.loadToken;
		this.store.setState({ loading: true, error: null, scenario: name });
		this.killUniverse();

		try {
			if (scenario.load) await scenario.load();
			if (token !== this.loadToken) return;
			const universe = new Universe(stage, scenario, settings, this.store);
			this.universe = universe;
			await universe.onSceneReady;
			if (token === this.loadToken) this.store.setState({ loading: false });
		} catch (e) {
			if (token !== this.loadToken) return;
			console.error(e);
			this.store.setState({ loading: false, error: errorMessage(e) });
		}
	}

	togglePlaying() {
		this.universe?.togglePlaying();
	}

	setDate(date: Date) {
		this.universe?.setDate(date);
	}

	setLookFrom(lookFrom: string) {
		this.universe?.setLookFrom(lookFrom);
	}

	setLookAt(lookAt: string) {
		this.universe?.setLookAt(lookAt);
	}

	setPlanetScale(scale: number) {
		this.universe?.setPlanetScale(scale);
	}

	setDeltaT(deltaT: number) {
		this.universe?.setDeltaT(deltaT);
	}

	setGeoloc(loc: GeoLoc) {
		this.universe?.setGeoloc(loc);
	}

	/** link to the current view */
	getShareUrl() {
		const { location } = window;
		const base = `${location.protocol}//${location.host}${location.pathname}`;
		if (!this.universe) return base;
		return `${base}?${new URLSearchParams(this.universe.getShareParams()).toString()}`;
	}
}
