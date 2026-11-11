import { Color } from 'three';
import type { BodyDefinition } from '../../types';

export const SUN_RADIUS = 6.96342e5;

export const sun: BodyDefinition = {
	title: 'The Sun',
	name: 'sun',
	mass: 1.9891e30,
	radius: SUN_RADIUS,
	color: '#ffff00',
	map: './assets/img/sunmap.jpg',
	k: 0.01720209895, //gravitational constant (μ)
	material: {
		emissive: new Color(0xdddd33),
	},
	//drawn with a corona shader instead of a textured sphere
	displayType: 'sun',
};
