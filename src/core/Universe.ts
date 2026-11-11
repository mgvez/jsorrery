import type { Vector3 } from 'three';

import { KM } from './constants';
import Simulation from './Simulation';
import JSOrreryScene from '../graphics3d/Scene';
import * as ResourceLoader from '../loaders/ResourceLoader';
import { getJD } from '../utils/JD';
import GeoCoord, { type GeoLoc } from '../utils/GeoCoord';
import type CelestialBody from './CelestialBody';
import type { GuiSettings, Scenario } from '../scenario/types';
import type { Store } from '../state/store';
import type { GuiState } from '../state/types';

const DEFAULT_PLANET_SCALE = 10;

function getInitialDate(date: GuiSettings['date']) {
	const d = date ? new Date(date) : new Date();
	return Number.isNaN(d.getTime()) ? new Date() : d;
}

/**
 A simulation displayed in a 3d scene, animated at each frame, and controlled by the GUI through the store.
 */
export default class Universe extends Simulation {
	scene: JSOrreryScene;
	store: Store<GuiState>;
	settings: GuiSettings;
	onSceneReady: Promise<void>;
	playing = false;
	drawRequested = false;
	killed = false;
	rafId = 0;
	size = 0;

	/**
	 @param rootElement element in which the scene is rendered
	 @param qstrSettings settings from the page (query string, page defaults), overridden by the scenario's forced settings
	 */
	constructor(rootElement: HTMLElement, scenario: Scenario, qstrSettings: GuiSettings | undefined, store: Store<GuiState>) {
		const settings: GuiSettings = { ...scenario.defaultGuiSettings, ...qstrSettings, ...scenario.forcedGuiSettings };
		super(scenario, getInitialDate(settings.date));
		ResourceLoader.reset();
		this.store = store;
		this.settings = settings;

		this.scene = new JSOrreryScene();
		this.calculateDimensions();
		this.scene.createStage(rootElement, scenario, this, settings.geoloc);

		this.initBodies(body => this.scene.addBody(body));
		this.scene.setCentralBody(this.centralBody);

		const cameraManager = this.scene.cameraManager;
		store.setState({
			scenario: scenario.name,
			playing: false,
			date: this.currentDate,
			geoloc: null,
			lookFromOptions: cameraManager.lookFromOptions,
			lookAtOptions: cameraManager.lookAtOptions,
			deltaTRange: { min: scenario.secondsPerTick.min, max: scenario.secondsPerTick.max, step: 1 },
		});

		this.onSceneReady = ResourceLoader.getOnReady().then(() => this.start());
	}

	/** applies the initial settings, once all resources are loaded, and starts the animation loop */
	private start() {
		if (this.killed) return;
		const { settings, scenario } = this;
		this.setPlanetScale(Number(settings.planetScale) || scenario.forcedGuiSettings?.scale || DEFAULT_PLANET_SCALE);
		this.setView(settings.lookFrom, settings.lookAt);
		this.setDeltaT(Number(settings.deltaT) || scenario.secondsPerTick.initial || 1);
		this.showDate();
		this.scene.setCameraDefaults(settings.cameraSettings);
		this.scene.draw();
		this.tick();
	}

	calculateDimensions() {
		const centralBodyName = this.getBody().name;
		//find the largest semi major axis in km among all bodies
		let largestSMA = this.bodies.reduce((memo, body) => {
			return (!body.isCentral && body.orbit && body.orbit.base && body.orbit.base.a! > memo) ? body.orbit.base.a! : memo;
		}, 0);
		let smallestSMA = this.bodies.reduce((memo, body) => {
			return (!body.isCentral && body.orbit && body.orbit.base && (!body.relativeTo || body.relativeTo === centralBodyName) && (!memo || body.orbit.base.a! < memo)) ? body.orbit.base.a! : memo;
		}, 0);
		smallestSMA *= KM;
		largestSMA *= KM;

		this.size = largestSMA;
		this.scene.setDimension(largestSMA, smallestSMA);
	}

	tick = () => {
		if (this.killed) return;
		if (this.playing) {
			this.advance();
			this.scene.updateCamera();
			this.scene.draw();
			this.showDate();
		} else {
			this.scene.updateCamera();
			if (this.drawRequested) {
				this.scene.draw();
			}
		}
		this.drawRequested = false;
		this.rafId = window.requestAnimationFrame(this.tick);
	};

	showDate() {
		this.store.setState({ date: this.getCurrentDate() });
	}

	override setJD(jd: number) {
		super.setJD(jd);
		this.drawRequested = true;
	}

	protected override onBodiesReset() {
		this.scene.onDateReset();
	}

	override requestDraw() {
		this.drawRequested = true;
	}

	override addEventLabel(text: string, position: Vector3, relativeTo: CelestialBody) {
		super.addEventLabel(text, position, relativeTo);
		this.scene.addEventLabel(text, position, relativeTo);
	}

	override stop() {
		super.stop();
		this.setPlaying(false);
	}

	// ------------------------------------------------------------------ controls (called from the GUI)

	setPlaying(playing: boolean) {
		this.playing = playing;
		this.store.setState({ playing });
	}

	togglePlaying() {
		this.setPlaying(!this.playing);
	}

	/** jumps to a date chosen by the user */
	setDate(date: Date) {
		this.setPlaying(false);
		this.setJD(getJD(date));
		this.repositionBodies(true);
		this.showDate();
	}

	setPlanetScale(scale: number) {
		this.scene.setPlanetScale(scale);
		this.store.setState({ planetScale: scale });
		this.scene.draw();
	}

	/** seconds of simulation per frame */
	setDeltaT(deltaT: number) {
		this.ticker.setSecondsPerTick(deltaT);
		this.store.setState({ deltaT });
	}

	/** sets the camera (lookFrom: a body, or the free camera) and its target (lookAt: a body, or a direction) */
	setView(lookFrom?: string, lookAt?: string) {
		const view = this.scene.cameraManager.setView(lookFrom, lookAt);
		this.store.setState(view);
	}

	setLookFrom(lookFrom: string) {
		this.setView(lookFrom, this.store.getState().lookAt);
	}

	setLookAt(lookAt: string) {
		this.setView(this.store.getState().lookFrom, lookAt);
	}

	/** position of the observer on a body's surface */
	setGeoloc(loc: GeoLoc) {
		this.scene.cameraManager.setGeoloc(loc);
	}

	/** called by the camera manager when the geolocation input should be shown (loc) or hidden (null) */
	onGeolocChange(loc: GeoLoc | null) {
		this.store.setState({ geoloc: loc });
	}

	resize(width: number, height: number) {
		this.scene.setSize(width, height);
		this.requestDraw();
	}

	/** values needed to recreate the current view, as found in a share url */
	getShareParams(): Record<string, string> {
		const state = this.store.getState();
		const cam = this.scene.getCamera();
		const params: Record<string, string> = {
			scenario: this.name,
			date: this.getCurrentDate().toISOString(),
			lookFrom: state.lookFrom,
			lookAt: state.lookAt,
			planetScale: String(state.planetScale),
			deltaT: String(state.deltaT),
		};
		if (state.geoloc) params.geoloc = new GeoCoord(state.geoloc.lat, state.geoloc.lng).getString();
		return {
			...params,
			cx: String(cam.position.x),
			cy: String(cam.position.y),
			cz: String(cam.position.z),
			fov: String(cam.fov),
		};
	}

	override kill() {
		//kills the animation callback
		this.killed = true;
		window.cancelAnimationFrame(this.rafId);
		this.scene.kill();
		super.kill();
	}
}
