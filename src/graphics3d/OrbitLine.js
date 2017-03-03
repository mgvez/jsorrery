

import { LineBasicMaterial, BufferGeometry, Geometry, Line, BufferAttribute, VertexColors } from 'three';
import Dimensions from './Dimensions';
import { darken, hexToRgb, rgbToHex } from '../utils/ColorUtils';
import { IS_SCREENSHOT, IS_CAPTURE } from '../constants';


export default {
	init(name, color, isSolid) {
		this.name = name;
		this.added = false;
		this.isSolid = isSolid;
		//for screenshots, dont darken color
		this.color = color;
	},

	createSolidLine(orbitVertices) {
		const material = new LineBasicMaterial({
			color: IS_SCREENSHOT || IS_CAPTURE ? this.color : rgbToHex(darken(hexToRgb(this.color), 0.5)),
		});
		orbitVertices.forEach(val => Dimensions.getScaled(val));
		const orbitGeom = new Geometry();
		orbitGeom.vertices = orbitVertices;
		return new Line(orbitGeom, material);
	},

	createGradientLine(orbitVertices) {
		const l = orbitVertices.length;
		const pos = orbitVertices.map((val) => {
			return Dimensions.getScaled(val);
		}).reduce((a, v, i) => {
			const n = i * 3;
			a[n] = v.x;
			a[n + 1] = v.y;
			a[n + 2] = v.z;
			return a;
		}, new Float32Array(l * 3));

		const colors = orbitVertices.map((v, i) => {
			return darken(hexToRgb(this.color), 1 - i / l);
		}).reduce((a, c, i) => {
			const n = i * 3;			
			a[n] = c.r / 255;
			a[n + 1] = c.g / 255;
			a[n + 2] = c.b / 255;
			return a;
		}, new Float32Array(l * 3));
		
		// const c = new CatmullRomCurve3(orbitVertices);
		// const geometry = new TubeBufferGeometry(c, 360, 0.1, 6, false);
		// const mat = new MeshBasicMaterial({
		// 	color: this.color,
		// });
		// this.line = new Mesh(geometry, mat);

		const material = new LineBasicMaterial({
			// color: this.color,
			vertexColors: VertexColors,
		});
		const orbitGeom = new BufferGeometry();

		orbitGeom.addAttribute('position', new BufferAttribute(pos, 3));
		orbitGeom.addAttribute('color', new BufferAttribute(colors, 3));

		return new Line(orbitGeom, material);
	},

	setLine(orbitVertices) {
		this.line = this.isSolid ? this.createSolidLine(orbitVertices) : this.createGradientLine(orbitVertices);
	},

	getDisplayObject() {
		return this.line;
	},

};
