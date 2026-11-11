// Generator of tests/fixtures/golden.json, run against the legacy code (commit 1e930aa).
// See README.md in this folder. Paths assume a copy of the legacy src/ in ../basesrc/src.
// Headless replica of the OLD Universe (src/core/Universe.js) without any graphics,
// used to record golden numeric fixtures from the pre-modernization code.
import CelestialBody from '../basesrc/src/core/CelestialBody';
import Ticker from '../basesrc/src/algorithm/Ticker';
import ScenarioLoader from '../basesrc/src/scenario/Loader';
import { getJD, getJ2000SecondsFromJD, getDateFromJD } from '../basesrc/src/utils/JD';
import { DAY, DEFAULT_CALCULATIONS_PER_TICK } from '../basesrc/src/core/constants';
import { Vector3 } from 'three';

class HeadlessUniverse {
	constructor(name, date) {
		const scenario = ScenarioLoader.get(name);
		this.scenario = scenario;
		this.name = name;
		this.events = [];
		this.ticker = new Ticker();
		this.usePhysics = scenario.usePhysics || false;
		this.setJD(getJD(date || scenario.forcedGuiSettings.date));
		this.createBodies(scenario);
		this.initBodies(scenario);
		this.ticker.setSecondsPerTick(scenario.secondsPerTick.initial);
		this.ticker.setCalculationsPerTick(scenario.calculationsPerTick || DEFAULT_CALCULATIONS_PER_TICK);
		// GUI defaults trigger CameraManager.toggleCamera -> universe.repositionBodies() (not forced)
		this.repositionBodies(false);
	}
	createBodies(scenario) {
		const bodiesNames = Object.keys(scenario.bodies);
		this.bodies = bodiesNames.map(name => {
			const body = Object.create(CelestialBody);
			Object.assign(body, scenario.bodies[name]);
			body.name = name;
			return body;
		});
		this.centralBody = this.bodies.reduce((current, candidate) => {
			return current && (current.isCentral || current.mass > candidate.mass) ? current : candidate;
		}, null);
		this.bodiesByName = this.bodies.reduce((byName, body) => { byName[body.name] = body; return byName; }, {});
		this.bodies.sort((a, b) => ((a.relativeTo || 0) && 1) - ((b.relativeTo || 0) && 1));
		this.centralBody.isCentral = true;
	}
	initBodies(scenario) {
		this.bodies.forEach(body => {
			if ((typeof scenario.usePhysics === 'undefined' || !scenario.usePhysics) && !body.isCentral) body.mass = 1;
			body.init(this);
			body.setPositionFromJD(this.currentJD);
		});
		this.setBarycenter();
		this.bodies.forEach(body => body.afterInitialized(true));
		this.ticker.setBodies(this.bodies);
	}
	setBarycenter() {
		const central = this.centralBody;
		if (!this.usePhysics || central.isStill || this.scenario.useBarycenter === false) return;
		let massRatio;
		const massCenter = { mass: 0, pos: new Vector3(), momentum: new Vector3() };
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
			if (central.mass / b.mass > 10e10) b.position.add(central.position);
		});
	}
	repositionBodies(forceReposition) {
		if (!forceReposition && this.scenario.usePhysics) return;
		this.bodies.forEach(body => { body.reset(); body.setPositionFromJD(this.currentJD); });
		this.ticker.tick(false, this.currentJD);
		this.setBarycenter();
		this.bodies.forEach(body => body.afterInitialized(false));
	}
	tick() {
		this.setJD(this.currentJD + (this.ticker.getDeltaT() / DAY));
		this.ticker.tick(this.usePhysics, this.currentJD);
	}
	getBody(name) { return (name === 'central' || !name) ? this.centralBody : this.bodiesByName[name]; }
	getScene() { return { addEventLabel: (tx) => this.events.push(tx.replace(/<br>/g, ' ')) }; }
	stop() { this.stopped = true; }
	requestDraw() {}
	setJD(jd) {
		this.currentJD = Number(jd);
		this.currentDate = getDateFromJD(this.currentJD);
		this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
	}
	getCurrentJ2000Time() { return this.currentJ2000Time; }
	getCurrentJD() { return this.currentJD; }
	getCurrentDate() { return this.currentDate; }
	getTickerDeltaT() { return this.ticker.getDeltaT(); }
}

const v = (vec) => [vec.x, vec.y, vec.z];
function snapshot(u) {
	const out = {};
	u.bodies.forEach(b => {
		out[b.name] = { pos: v(b.getPosition()), vel: v(b.getAbsoluteVelocity()) };
	});
	return { jd: u.currentJD, bodies: out };
}

const DATES = ['2017-08-21T18:00:00.000Z', '1969-07-16T16:22:13.000Z', '2024-04-08T18:17:00.000Z', '1600-01-01T00:00:00.000Z'];
const ELEMENT_SCENARIOS = ['SolarSystem', 'SolarSystemDwarves', 'InnerSolarSystem', 'EarthMoon', 'JupiterMoon', 'Artificial'];

const fixtures = { elements: {}, precise: {}, physics: {} };

const t0 = Date.now(); const lg = (m) => process.stderr.write(`[${((Date.now()-t0)/1000).toFixed(1)}s] ${m}\n`);
for (const name of ELEMENT_SCENARIOS) {
	fixtures.elements[name] = DATES.map(date => {
		lg(`elements ${name} ${date}`);
		const u = new HeadlessUniverse(name, new Date(date));
		const initial = snapshot(u);
		for (let i = 0; i < 25; i++) u.tick();
		return { date, initial, after25: snapshot(u) };
	});
}

lg('precise');
// max precision positions (VSOP for earth & mercury, ELP for the moon)
{
	const u = new HeadlessUniverse('InnerSolarSystem', new Date(DATES[0]));
	fixtures.precise = DATES.map(date => {
		const jd = getJD(new Date(date));
		const res = {};
		['earth', 'mercury', 'moon'].forEach(n => {
			res[n] = v(u.getBody(n).calculatePosition(jd, true));
		});
		return { date, jd, bodies: res };
	});
}

// [scenario, ticks, snapshot every n ticks, calculationsPerTick override]
const PHYSICS = [['Apollo', 1500, 250, null], ['BigJupiter', 60, 20, null], ['MoonSoi', 6, 2, 10]];
for (const [name, n, every, calcs] of PHYSICS) {
	lg(`physics ${name}`);
	const u = new HeadlessUniverse(name, name === 'Apollo' ? null : new Date(DATES[0]));
	if (calcs) u.ticker.setCalculationsPerTick(calcs);
	const steps = [snapshot(u)];
	let i = 1;
	for (; i <= n; i++) {
		u.tick();
		if (i % every === 0) { steps.push(snapshot(u)); lg(`  ${name} tick ${i}`); }
		if (u.stopped) break;
	}
	fixtures.physics[name] = { ticks: n, every, calcs, steps, events: u.events, stoppedAt: u.stopped ? i : null };
}

require('fs').writeFileSync(process.env.OUT, JSON.stringify(fixtures));
process.exit(0);
