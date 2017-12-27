
import { AU } from '../../../core/constants';

export const mercury = {
	title: 'Mercury',
	name: 'mercury',
	mass: 3.3022e23,
	radius: 2439,
	color: '#588a7b',
	map: './assets/img/mercurymap.jpg',
	orbit: { 
		base: {
			a: 0.38709927 * AU,
			e: 0.20563593,
			i: 7.00497902,
			l: 252.25032350,
			lp: 77.45779628,
			o: 48.33076593,
		},
		cy: {
			a: 0.00000037 * AU,
			e: 0.00001906,
			i: -0.00594749,
			l: 149472.67411175,
			lp: 0.16047689,
			o: -0.12534081,
		},
	},
};
