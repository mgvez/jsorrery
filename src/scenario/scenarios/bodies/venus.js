
import { AU } from '../../../core/constants';

export const venus = {
	title: 'Venus',
	name: 'venus',
	mass: 4.868e24,
	radius: 6051,
	color: '#fda700',
	map: './assets/img/venusmap.jpg',
	orbit: {
		base: {
			a: 0.72333566 * AU,
			e: 0.00677672,
			i: 3.39467605,
			l: 181.97909950,
			lp: 131.60246718,
			o: 76.67984255,
		},
		cy: {
			a: 0.00000390 * AU,
			e: -0.00004107,
			i: -0.00078890,
			l: 58517.81538729,
			lp: 0.00268329,
			o: -0.27769418,
		},
	},
};
