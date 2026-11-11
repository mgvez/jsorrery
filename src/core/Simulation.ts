import { Vector3 } from 'three';

import { USE_PHYSICS_BY_DEFAULT, DEFAULT_CALCULATIONS_PER_TICK, DAY } from './constants';
import Ticker from '../algorithm/Ticker';
import CelestialBody from './CelestialBody';
import { getJD, getJ2000SecondsFromJD, getDateFromJD } from '../utils/JD';
import type { Scenario } from '../scenario/types';

export interface EventLabel {
	text: string;
	position: Vector3;
	relativeTo: CelestialBody;
}

/**
 The bodies of a scenario and the computation of their positions over time, without any display.
 Universe extends it with a 3d scene; on its own, it can run headless (e.g. in tests).
 */
export default class Simulation {
	name: string;
	scenario: Scenario;
	ticker = new Ticker();
	usePhysics: boolean;
	bodies: CelestialBody[] = [];
	bodiesByName: Record<string, CelestialBody> = {};
	declare centralBody: CelestialBody;
	declare currentJD: number;
	declare currentDate: Date;
	declare currentJ2000Time: number;
	stopped = false;
	/** labels created by scenarios to mark events (e.g. closest approach) */
	eventLabels: EventLabel[] = [];

	constructor(scenario: Scenario, date: Date) {
		this.name = scenario.name;
		this.scenario = scenario;
		this.usePhysics = scenario.usePhysics || USE_PHYSICS_BY_DEFAULT;
		this.setJD(getJD(date));
		this.createBodies(scenario);
	}

	/** initializes positions. onBodyReady is called for each body, before its relative positioning */
	initBodies(onBodyReady?: (body: CelestialBody) => void) {
		const scenario = this.scenario;
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
			if (onBodyReady) onBodyReady(body);
			body.afterInitialized(true);
		});

		this.ticker.setBodies(this.bodies);
		this.ticker.setSecondsPerTick(scenario.secondsPerTick.initial);
		this.ticker.setCalculationsPerTick(scenario.calculationsPerTick || DEFAULT_CALCULATIONS_PER_TICK);
	}

	createBodies(scenario: Scenario) {
		const bodiesNames = Object.keys(scenario.bodies);
		this.bodies = bodiesNames.map(name => new CelestialBody({ ...scenario.bodies[name], name }));

		this.centralBody = this.bodies.reduce<CelestialBody | null>((current, candidate) => {
			return current && (current.isCentral || current.mass > candidate.mass) ? current : candidate;
		}, null)!;

		this.bodiesByName = this.bodies.reduce<Record<string, CelestialBody>>((byName, body) => {
			byName[body.name] = body;
			return byName;
		}, {});

		this.bodies.sort((a, b) => {
			return (a.relativeTo ? 1 : 0) - (b.relativeTo ? 1 : 0);
		});

		this.centralBody.isCentral = true;
	}

	/* balance the system by calculating the masses of the non-central bodies and placing the central body to balance it.*/
	setBarycenter() {
		const central = this.centralBody;

		if (!this.usePhysics || central.isStill || this.scenario.useBarycenter === false) return;
		let massRatio: number;
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
		this.bodies.forEach((b) => {
			if (b === central || (b.relativeTo && b.relativeTo !== central.name)) return;
			b.addToAbsoluteVelocity(central.getAbsoluteVelocity());
			//if central body's mass is way bigger than the object, we assume that the central body is the center of rotation. Otherwise, it's the barycenter
			if (central.mass / b.mass > 10e10) {
				b.position.add(central.position);
			}
		});
	}

	/**
	 Recomputes all positions from the current date.
	 If not forced, physics based scenarios are not repositionned (orbital elements are only used for their initial positions).
	 */
	repositionBodies(forceReposition: boolean) {
		if (!forceReposition && this.scenario.usePhysics) return false;

		this.bodies.forEach(body => {
			body.reset();
			body.setPositionFromJD(this.currentJD);
		});

		this.onBodiesReset();

		this.ticker.tick(false, this.currentJD);

		this.setBarycenter();

		//adjust position depending on other bodies' position (for example a satellite is relative to its main body)
		this.bodies.forEach(body => {
			body.afterInitialized(false);
		});
		return true;
	}

	/** called when the positions have been reset, before they are recomputed */
	protected onBodiesReset() {}

	/** advances the simulation by one tick */
	advance() {
		this.setJD(this.currentJD + (this.ticker.getDeltaT() / DAY));
		this.ticker.tick(this.usePhysics, this.currentJD);
	}

	getBody(name?: string) {
		if (name === 'central' || !name) {
			return this.centralBody;
		}
		return this.bodiesByName[name];
	}

	getTickerDeltaT() {
		return this.ticker.getDeltaT();
	}

	setJD(jd: number) {
		this.currentJD = Number(jd);
		this.currentDate = getDateFromJD(this.currentJD);
		this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
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

	addEventLabel(text: string, position: Vector3, relativeTo: CelestialBody) {
		this.eventLabels.push({ text, position, relativeTo });
	}

	/** stops the animation (scenarios can stop it when an event occurs) */
	stop() {
		this.stopped = true;
	}

	/** asks for a render of the scene at next frame. No-op without a scene. */
	requestDraw() {}

	kill() {
		this.bodies.forEach(b => b.kill());
		this.bodies = [];
		this.bodiesByName = {};
	}
}
