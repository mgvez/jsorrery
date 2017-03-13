
import { Color } from 'three';

export const sun = {
	title: 'The Sun',
	name: 'sun',
	mass: 1.9891e30,
	radius: 6.96342e5,
	color: '#ffff00',
	map: 'img/sunmap.jpg',
	k: 0.01720209895, //gravitational constant (μ)
	material: {
		emissive: new Color(0xdddd33),
	},
};
