
import { sun } from './bodies/sun';
import { moon } from './bodies/moon';
import { mercury } from './bodies/mercury';
import { venus } from './bodies/venus';
import { earth } from './bodies/earth';
import { mars } from './bodies/mars';

export default {
	name: 'InnerSolarSystem',
	title: 'Inner Solar System',
	commonBodies: [
		sun,
		mercury,
		venus,
		earth,
		moon,
		mars,
	],
	secondsPerTick: { min: 60, max: 3600 * 15, initial: 3600 }, //3600 * 24 * 2,
	defaultGuiSettings: { 
		planetScale: 10,
	},
	help: "Includes all the planets from Mercury to Mars, plus the Earth's moon.",
};
