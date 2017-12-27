
import { Color } from 'three';
import Sun from '../../../graphics3d/Sun';

export const radius = 6.96342e5;

export const sun = {
	title: 'The Sun',
	name: 'sun',
	mass: 1.9891e30,
	radius,
	color: '#ffff00',
	map: './assets/img/sunmap.jpg',
	k: 0.01720209895, //gravitational constant (μ)
	material: {
		emissive: new Color(0xdddd33),
	},

	createCustomDisplayObject() {
		const sunDisplay = this.displayObj = new Sun(this);

		this.getBody3D = () => sunDisplay;
		// const hasCelestial = this.centralBody && this.centralBody.name === 'sun';
		// sunDisplay.setLight();
		return sunDisplay;
	},

};
