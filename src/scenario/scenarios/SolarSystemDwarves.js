
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
import { halley } from './bodies/halley';
import { ceres } from './bodies/ceres';
import { eris } from './bodies/eris';
import { makemake } from './bodies/makemake';
import { haumea } from './bodies/haumea';

export default {
	name: 'SolarSystemDwarves',
	title: 'Solar System with dwarf planets',
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
		halley,
		eris,
		ceres,
		makemake,
		haumea,
	],
	secondsPerTick: { min: 3600 * 5, max: 3600 * 25, initial: 3600 * 10 },
	defaultGuiSettings: { 
		planetScale: 10,
	},
	help: "This scenario shows all the planets of the Solar System plus dwarf planets. Also included is Halley's comet, but its orbit is an approximation, as I was not able to find its accurate orbital elements.",
};
