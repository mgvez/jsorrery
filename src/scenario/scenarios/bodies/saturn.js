
import { AU } from '../../../core/constants';

export const saturn = {
	title: 'Saturn',
	name: 'saturn',
	mass: 5.6846e26,
	radius: 58232,
	color: '#ffcc99',
	map: './assets/img/saturnmap.jpg',
	tilt: 26.7,
	ring: {
		innerRadius: 74500,
		outerRadius: 117580,
		map: './assets/img/saturnrings.png',
	},
	orbit: {
		base: {
			a: 9.53667594 * AU,
			e: 0.05386179,
			i: 2.48599187,
			l: 49.95424423,
			lp: 92.59887831,
			o: 113.66242448,
		},
		cy: {
			a: -0.00125060 * AU,
			e: -0.00050991,
			i: 0.00193609,
			l: 1222.49362201,
			lp: -0.41897216,
			o: -0.28867794,
		},
	},
};
