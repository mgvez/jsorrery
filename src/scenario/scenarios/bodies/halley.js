
import { AU } from '../../../core/constants';
import { getJD } from '../../../utils/JD';

export const halley = {
	title: 'Halley\'s Comet',
	name: 'halley',
	mass: 2.2e14,
	radius: 50,
	color: '#999999',
	orbit: {
		epoch: getJD(new Date('1994-02-17T00:00:00.000Z')),
		base: {
			a: 17.8341442925537 * AU,
			e: 0.967142908462304,
			i: 162.262690579161,
			M: 38.3842644764388, //360 * (438393600 / (75.1 * YEAR * DAY)),
			w: 111.3324851045177,
			o: 58.42008097656843,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 0.01308656479244564,
			w: 0,
			o: 0,
		},
	},
};
