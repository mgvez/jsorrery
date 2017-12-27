
import { AU } from '../../../core/constants';
import { getJD } from '../../../utils/JD';

export const eris = {
	title: 'Eris',
	name: 'eris',
	mass: 893.2e20,
	radius: 1821.6,
	color: '#999999',
	orbit: {
		epoch: getJD(new Date('2007-02-07T00:00:00.000Z')),	
		base: {
			a: 67.72049983633802 * AU,
			e: 0.4402757254627496,
			w: 151.5325796513168,
			M: 197.9288256170611,
			i: 44.16476529362038,
			o: 35.88169902286788,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 0.001768576,
			w: 0,
			o: 0,
		},
	},
};
