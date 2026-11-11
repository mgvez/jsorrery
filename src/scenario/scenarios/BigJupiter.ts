
import { sun } from './bodies/sun';
import { mercury } from './bodies/mercury';
import { venus } from './bodies/venus';
import { earth } from './bodies/earth';
import { mars } from './bodies/mars';
import { jupiter } from './bodies/jupiter';
import { saturn } from './bodies/saturn';
import { uranus } from './bodies/uranus';
import { neptune } from './bodies/neptune';
import { pluto } from './bodies/pluto';
import type { ScenarioDefinition } from '../types';


const scenario: ScenarioDefinition = {
	name: 'BigJupiter',
	title: 'If Jupiter was 1000X its mass',
	commonBodies: [
		sun,
		mercury,
		venus,
		earth,
		mars,
		jupiter,
		saturn,
		uranus,
		neptune,
		pluto,
	],
	bodies: {
		sun: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		jupiter: {
			mass: 5.6846e26 * 1000,
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		mercury: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		venus: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		earth: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		mars: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		saturn: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		uranus: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		neptune: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
		pluto: {
			forceTrace: true,
			traceRelativeTo: 'universe',
		},
	},
	secondsPerTick: { min: 3600, max: 3600 * 15, initial: 3600 * 5 },
	// NOTE: this was originally written `calculaionsPerTick: 100` (typo), so this scenario has always used the default
	// number of calculations per tick. Kept as is so that the simulation doesn't change; set calculationsPerTick to 100 if intended.
	usePhysics: true,
	useBarycenter: false,
	defaultGuiSettings: { 
		planetScale: 10,
	},
	help: "This scenario shows what would happen if, instantaneously at this moment, Jupiter's mass grew 1000 times larger.",
};

export default scenario;
