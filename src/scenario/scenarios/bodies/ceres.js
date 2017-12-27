
import { AU } from '../../../core/constants';
import { getJD } from '../../../utils/JD';

export const ceres = {
	title: 'Ceres',
	name: 'ceres',
	mass: 893.2e20,
	radius: 1821.6,
	color: '#999999',
	orbit: {
		epoch: 2449731.5,
		base: {
			a: 2.767218108003098 * AU,
			e: 0.07610292126891821, 
			w: 71.44921526124109,
			M: 340.389084821267,
			i: 10.60069567603618,
			o: 80.65851514365535,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 0.214110998,
			w: 0,
			o: 0,
		},
	},
};
