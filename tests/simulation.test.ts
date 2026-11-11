/**
 Regression tests of the simulation against values computed by the original JavaScript implementation
 (commit 1e930aa, three.js r82), see tests/fixtures/README.md.
 */
import { describe, expect, it } from 'vitest';
import type { Vector3 } from 'three';
import goldenJson from './fixtures/golden.json';
import Simulation from '../src/core/Simulation';
import { getScenario } from '../src/scenario/Loader';
import { getJD } from '../src/utils/JD';

type Vec = [number, number, number];
interface Snapshot {
	jd: number;
	bodies: Record<string, { pos: Vec; vel: Vec }>;
}

interface Golden {
	elements: Record<string, { date: string; initial: Snapshot; after25: Snapshot }[]>;
	precise: { date: string; jd: number; bodies: Record<string, Vec> }[];
	physics: Record<string, { ticks: number; every: number; calcs: number | null; steps: Snapshot[]; events: string[]; stoppedAt: number | null }>;
}

const golden = goldenJson as unknown as Golden;

// all computations are ported operation by operation, so results should match to floating point noise
const RELATIVE_TOLERANCE = 1e-9;

function createSimulation(name: string, date?: string, calculationsPerTick?: number | null) {
	const scenario = getScenario(name);
	if (!scenario) throw new Error(`unknown scenario ${name}`);
	const startDate = date ? new Date(date) : new Date(scenario.forcedGuiSettings!.date!);
	const sim = new Simulation(scenario, startDate);
	sim.initBodies();
	//the GUI sets the camera when the scene is ready, which repositions the bodies (if the scenario is not physics based)
	sim.repositionBodies(false);
	if (calculationsPerTick) sim.ticker.setCalculationsPerTick(calculationsPerTick);
	return sim;
}

const toArray = (v: Vector3): Vec => [v.x, v.y, v.z];

function snapshot(sim: Simulation): Snapshot {
	const bodies: Snapshot['bodies'] = {};
	sim.bodies.forEach(b => {
		bodies[b.name] = { pos: toArray(b.getPosition()), vel: toArray(b.getAbsoluteVelocity()) };
	});
	return { jd: sim.currentJD, bodies };
}

function relativeError(actual: Vec, expected: Vec) {
	const diff = Math.hypot(actual[0] - expected[0], actual[1] - expected[1], actual[2] - expected[2]);
	const magnitude = Math.hypot(...expected);
	return magnitude === 0 ? diff : diff / magnitude;
}

function expectSnapshot(actual: Snapshot, expected: Snapshot) {
	expect(actual.jd).toBeCloseTo(expected.jd, 9);
	expect(Object.keys(actual.bodies).sort()).toEqual(Object.keys(expected.bodies).sort());
	Object.entries(expected.bodies).forEach(([name, { pos, vel }]) => {
		expect(relativeError(actual.bodies[name].pos, pos), `${name} position`).toBeLessThan(RELATIVE_TOLERANCE);
		expect(relativeError(actual.bodies[name].vel, vel), `${name} velocity`).toBeLessThan(RELATIVE_TOLERANCE);
	});
}

describe('positions from orbital elements', () => {
	Object.entries(golden.elements).forEach(([name, cases]) => {
		cases.forEach(({ date, initial, after25 }) => {
			it(`${name} at ${date}, then after 25 ticks`, () => {
				const sim = createSimulation(name, date);
				expectSnapshot(snapshot(sim), initial);
				for (let i = 0; i < 25; i++) sim.advance();
				expectSnapshot(snapshot(sim), after25);
			});
		});
	});
});

describe('precise positions (VSOP87 / ELP2000)', () => {
	const sim = createSimulation('InnerSolarSystem', golden.precise[0].date);
	golden.precise.forEach(({ date, jd, bodies }) => {
		it(`earth, mercury and moon at ${date}`, () => {
			expect(getJD(new Date(date))).toBeCloseTo(jd, 9);
			Object.entries(bodies).forEach(([name, expected]) => {
				const actual = toArray(sim.getBody(name).calculatePosition(jd, true));
				expect(relativeError(actual, expected), name).toBeLessThan(RELATIVE_TOLERANCE);
			});
		});
	});
});

describe('physics (gravity integration)', () => {
	Object.entries(golden.physics).forEach(([name, run]) => {
		it(`${name}: ${run.ticks} ticks`, () => {
			const sim = createSimulation(name, name === 'Apollo' ? undefined : golden.elements.SolarSystem[0].date, run.calcs);
			const steps = [snapshot(sim)];
			let i = 1;
			for (; i <= run.ticks; i++) {
				sim.advance();
				if (i % run.every === 0) steps.push(snapshot(sim));
				if (sim.stopped) break;
			}
			expect(steps.length).toBe(run.steps.length);
			steps.forEach((step, idx) => expectSnapshot(step, run.steps[idx]));
			expect(sim.eventLabels.map(label => label.text.replace(/<br>/g, ' '))).toEqual(run.events);
			expect(sim.stopped ? i : null).toBe(run.stoppedAt);
		});
	});
});
