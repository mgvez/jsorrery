
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

export default {
	name: 'SolarSystem',
	title: 'Solar System',
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
	secondsPerTick: { min: 3600 * 5, max: 3600 * 25, initial: 3600 * 10 },
	defaultGuiSettings: { 
		planetScale: 10,
	},
	help: 'This scenario shows all the planets of the Solar System. This includes Pluto, because Pluto will always be a planet in my heart.',
};
