
import { AU } from '../../../core/constants';
import { getJD } from '../../../utils/JD';

export const makemake = {
	title: 'Makemake',
	name: 'makemake',
	mass: 893.2e20,
	radius: 1821.6,
	color: '#999999',
	orbit: {
		epoch: getJD(new Date('2009-08-01T00:00:00.000Z')),	
		base: {
			a: 45.37454855956828 * AU,
			e: 0.1626228804111456,
			w: 295.1879304740464,
			M: 152.3170330164037,
			i: 29.00057606872671,
			o: 79.52652691394422
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 0.003224672,
			w: 0,
			o: 0,
		},
	},
};
