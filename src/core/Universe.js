/** 


*/

import { Vector3 } from 'three';

import { USE_PHYSICS_BY_DEFAULT, DEFAULT_CALCULATIONS_PER_TICK, KM, J2000, DAY } from './constants';
import Scene from '../graphics3d/Scene';
import ResourceLoader from '../loaders/ResourceLoader';
import Ticker from '../algorithm/Ticker';
import CelestialBody from './CelestialBody';
import { START_ID, DELTA_T_ID } from '../gui/Gui';
import { getJD, getJ2000SecondsFromJD, getDateFromJD } from '../utils/JD';
import Dimensions from '../graphics3d/Dimensions';


export default class Universe {

	constructor(rootElement, scenarioConfig, defaultParams, gui) {
		//some scenarios need to load data before they are ready
		this.gui = gui;
		const getSceneReady = () => {
			return this.init(rootElement, scenarioConfig, defaultParams);
		}
		if (scenarioConfig.load) {
			this.onSceneReady = scenarioConfig.load().then(getSceneReady);
		} else {
			this.onSceneReady = getSceneReady();
		}

	}

	init(rootElement, scenario, qstrSettings) {
		ResourceLoader.reset();
		this.name = scenario.name;
		this.scenario = scenario;
		this.ticker = new Ticker();
		
		const initialSettings = Object.assign({}, scenario.defaultGuiSettings, qstrSettings, scenario.forcedGuiSettings);
		// console.log(initialSettings);
		this.gui.setDefaults(initialSettings);
		
		this.usePhysics = scenario.usePhysics || USE_PHYSICS_BY_DEFAULT;
		
		//start/stop
		this.gui.addBtn('play', START_ID, () => {
			this.playing = !this.playing;
		}, 'p');

		this.dateDisplay = this.gui.addDate(() => {
			this.playing = false;
			this.setJD(getJD(this.dateDisplay.getDate()));
			this.repositionBodies(true);
		});
		
		this.playing = false;
		this.drawRequested = false;

		const date = this.dateDisplay.getDate() || new Date();
		this.setJD(getJD(date));
		
		this.createBodies(scenario);
		this.scene = new Scene();
		this.calculateDimensions();
		this.scene.createStage(rootElement, scenario, this.gui, this);

		this.initBodies(scenario);
		this.ticker.setSecondsPerTick(scenario.secondsPerTick.initial);
		this.ticker.setCalculationsPerTick(scenario.calculationsPerTick || DEFAULT_CALCULATIONS_PER_TICK);
		const onSceneReady = ResourceLoader.getOnReady();

		onSceneReady.done(() => {
			this.showDate();
			this.gui.putDefaults();
			this.scene.setCameraDefaults(initialSettings.cameraSettings);
			this.scene.draw();
			this.tick();
		});

		//delta T slider
		this.gui.addSlider(DELTA_T_ID, scenario.secondsPerTick, (val) => {
			// console.log(val, scenario.secondsPerTick);
			this.ticker.setSecondsPerTick(val);
		});

		return onSceneReady;

	}

	kill() {
		//kills the animation callback
		this.killed = true;
		this.dateDisplay.setDate(null);
		if (!this.scene) return;
		this.scene.kill();
		this.centralBody = null;
		this.scene = null;
		this.bodies.forEach(b => b.kill());
		this.bodies = [];
		this.bodiesByName = {};

	}

	getTickerDeltaT() {
		return this.ticker.getDeltaT();
	}

	createBodies(scenario) {
		
		const bodiesNames = Object.keys(scenario.bodies);
		this.bodies = bodiesNames.map(name => {
			const config = scenario.bodies[name];
			const body = Object.create(CelestialBody);
			Object.assign(body, config);
			body.name = name;
			return body;
		});

		this.centralBody = this.bodies.reduce((current, candidate) => {
			return current && (current.isCentral || current.mass > candidate.mass) ? current : candidate;
		}, null);

		this.bodiesByName = this.bodies.reduce((byName, body) => {
			byName[body.name] = body;
			return byName;
		}, {});

		this.bodies.sort((a, b) => {
			return ((a.relativeTo || 0) && 1) - ((b.relativeTo || 0) && 1);
		});

		this.centralBody.isCentral = true;
		// console.log(this.bodies);
	}

	initBodies(scenario) {
		this.bodies.forEach(body => {
			if ((typeof scenario.usePhysics === 'undefined' || !scenario.usePhysics) && !body.isCentral) {
				body.mass = 1;
			}
			body.init(this);
			body.setPositionFromJD(this.currentJD);
		});

		this.setBarycenter();

		//after all is inialized
		this.bodies.forEach(body => {
			// console.log(body.name, body.isCentral);
			this.scene.addBody(body);
			body.afterInitialized(true);
		});
		
		this.scene.setCentralBody(this.centralBody);

		this.ticker.setBodies(this.bodies);
	}
	/* balance the system by calculating hte masses of the non-central bodies and placing the central body to balance it.*/
	setBarycenter() {

		const central = this.centralBody;
		
		if (!this.usePhysics || central.isStill || this.scenario.useBarycenter === false) return;
		let massRatio;
		const massCenter = {
			mass: 0,
			pos: new Vector3(),
			momentum: new Vector3(),
		};

		this.bodies.forEach((b) => {
			if (b === central) return;
			massCenter.mass += b.mass;
			massRatio = b.mass / massCenter.mass;
			massCenter.pos = massCenter.pos.add(b.getPosition().multiplyScalar(massRatio));
			massCenter.momentum = massCenter.momentum.add(b.getAbsoluteVelocity().multiplyScalar(b.mass));
		});

		massCenter.momentum.multiplyScalar(1 / massCenter.mass);
		massRatio = massCenter.mass / central.mass;
		central.setVelocity(massCenter.momentum.multiplyScalar(massRatio * -1));
		central.position = massCenter.pos.clone().multiplyScalar(massRatio * -1);
		// console.log(central.position);
		this.bodies.forEach((b) => {
			if (b === central || (b.relativeTo && b.relativeTo !== central.name)) return;
			b.addToAbsoluteVelocity(central.getAbsoluteVelocity());
			//if central body's mass is way bigger than the object, we assume that the central body is the center of rotation. Otherwise, it's the barycenter
			if (central.mass / b.mass > 10e10) {
				b.position.add(central.position);
			}
		});
	}

	repositionBodies(forceReposition) {
		// console.log(this.bodies);

		//if we reposition bodies on camera change, we don't reset if scenario is physics based (orbital elements are only used for initial pos)
		if (!forceReposition && this.scenario.usePhysics) return false;

		this.bodies.forEach(body => {
			body.reset();
			body.setPositionFromJD(this.currentJD, body.orbitalElements && body.orbitalElements.orbitalElements && body.orbitalElements.orbitalElements.dbg);
			// console.log(body.name);
		});

		this.scene.onDateReset();

		this.ticker.tick(false, this.currentJD);

		this.setBarycenter();

		//adjust position depending on other bodies' position (for example a satellite is relative to its main body)
		this.bodies.forEach(body => {
			body.afterInitialized(false);
		});
	}

	getBody(name) {
		// console.log(this);
		if (name === 'central' || !name) {
			return this.centralBody;
		}
		return this.bodiesByName[name];
	}

	getCamera() {
		return this.scene.getCamera();
	}

	calculateDimensions(sceneSize) {
		const centralBodyName = this.getBody().name;
		//find the largest radius in km among all bodies
		let largestRadius = this.bodies.reduce((memo, body) => {
			return memo < body.radius ? body.radius : memo;
		}, 0);
		//find the largest semi major axis in km among all bodies
		let largestSMA = this.bodies.reduce((memo, body) => { 
			return (!body.isCentral && body.orbit && body.orbit.base.a > memo) ? body.orbit.base.a : memo;
		}, 0);
		let smallestSMA = this.bodies.reduce((memo, body) => { 
			return (!body.isCentral && body.orbit && (!body.relativeTo || body.relativeTo === centralBodyName) && (!memo || body.orbit.base.a < memo)) ? body.orbit.base.a : memo;
		}, 0);
		smallestSMA *= KM;
		largestSMA *= KM;
		largestRadius *= KM;

		//console.log('universe size', largestSMA, ' m');
		
		this.size = largestSMA;
		this.scene.setDimension(largestSMA, smallestSMA);

	}

	showDate() {
		this.dateDisplay.setDate(this.getCurrentDate());
	}

	tick = () => {

		if (this.killed) return;
		if (this.playing) {
			this.setJD(this.currentJD + (this.ticker.getDeltaT() / DAY));
			this.ticker.tick(this.usePhysics, this.currentJD);
			
			this.scene.updateCamera();
			this.scene.draw();
			this.showDate();
		} else {
			// console.log('draw...');
			this.scene.updateCamera();
			if (this.drawRequested) {
				// console.log('draw', this.currentJD);
				this.scene.draw();
			}
		}
		this.drawRequested = false;
		window.requestAnimationFrame(this.tick);
	}

	requestDraw() {
		this.drawRequested = true;
	}

	getScene() {
		return this.scene;
	}

	setJD(jd) {
		this.currentJD = Number(jd);
		// console.log(this.currentJD);
		this.currentDate = getDateFromJD(this.currentJD);
		this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
		this.drawRequested = true;
	}

	getCurrentJ2000Time() {
		return this.currentJ2000Time;
	}

	getCurrentJD() {
		return this.currentJD;
	}

	getCurrentDate() {
		return this.currentDate;
	}

	isPlaying() {
		return this.playing;
	}

	stop(skipRender) {
		this.playing = false;
		if (skipRender) return;
		this.scene.updateCamera();
		this.scene.draw();
	}

	getScaledDimension(dim) {
		return Dimensions.getScaled(dim);
	}
};
