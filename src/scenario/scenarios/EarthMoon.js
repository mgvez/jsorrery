
import { earth } from './bodies/earth';
import { moon } from './bodies/moon';


export default {
	name: 'EarthMoon',
	title: 'The Moon and the Earth',
	commonBodies: [earth, moon],
	secondsPerTick: { min: 60, max: 3600 * 5, initial: 3600 },
	help: 'Only the Earth and its moon.',
	forcedGuiSettings: {
		scale: 1,
	},
};
