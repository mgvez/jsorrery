

import { LineBasicMaterial, Geometry, Line } from 'three';
import Dimensions from './Dimensions';
import { darken, hexToRgb, rgbToHex } from '../utils/ColorUtils';


export default {
	init(name, color) {
		this.name = name;
		this.added = false;
		this.color = rgbToHex(darken(hexToRgb(color), 0.75));
	},

	setLine(orbitVertices) {
		const material = new LineBasicMaterial({
			color: this.color,
		});
		orbitVertices.forEach(val => Dimensions.getScaled(val));
		const orbitGeom = new Geometry();
		orbitGeom.vertices = orbitVertices;
		this.line = new Line(orbitGeom, material);
	},

	getDisplayObject() {
		return this.line;
	},

};
