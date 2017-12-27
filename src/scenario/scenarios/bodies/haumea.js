
import { AU } from '../../../core/constants';
import { getJD } from '../../../utils/JD';

export const haumea = {
	title: 'Haumea',
	name: 'haumea',
	mass: 893.2e20,
	radius: 1821.6,
	color: '#999999',
	orbit: {
		epoch: getJD(new Date('2009-01-29T00:00:00.000Z')),	
		base: {
			a: 43.11668586903614 * AU,
			e: 0.1953963724610412,
			w: 239.2416693131013,
			M: 202.8195761971326,
			i: 28.2241529659211,
			o: 122.1018599614831,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 0.003481256,
			w: 0,
			o: 0,
		},
	},
};
