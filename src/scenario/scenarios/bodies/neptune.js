
import { AU } from '../../../core/constants';

export const neptune = {
	title: 'Neptune',
	name: 'neptune',
	mass: 1.0243e26,
	radius: 24764,
	color: '#3299ff',
	map: './assets/img/neptunemap.jpg',
	orbit: {
		base: {
			a: 30.06992276 * AU,
			e: 0.00859048,
			i: 1.77004347,
			l: -55.12002969,
			lp: 44.96476227,
			o: 131.78422574,
		},
		cy: {
			a: 0.00026291 * AU,
			e: 0.00005105,
			i: 0.00035372,
			l: 218.45945325,
			lp: -0.32241464,
			o: -0.00508664,
		},
	},
};
