

import { LineBasicMaterial, BufferGeometry, Geometry, Line, BufferAttribute, VertexColors, Vector3 } from 'three';
import Dimensions from 'graphics3d/Dimensions';
import { darken, hexToRgb, rgbToHex } from 'utils/ColorUtils';
import { IS_SCREENSHOT, IS_CAPTURE } from 'constants';


export default {
	init(name, color, isSolid) {
		this.name = name;
		this.added = false;
		this.isSolid = isSolid;
		this.isGradient = !isSolid;
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
		this.orbitVertices = orbitVertices.map((val) => {
			return Dimensions.getScaled(val);
		});

		this.nVertices = this.orbitVertices.length;

		const nNumbers = this.nPos = l * 3;

		const pos = this.positions = new Float32Array(3 + nNumbers);
		this.buildPositions();

		pos[nNumbers] = this.orbitVertices[0].x;
		pos[nNumbers + 1] = this.orbitVertices[0].y;
		pos[nNumbers + 2] = this.orbitVertices[0].z;
		

		const origColor = hexToRgb(this.color);
		const colors = orbitVertices.map((v, i) => {
			return origColor;
			// return darken(origColor, 1 - i / l);
		}).reduce((a, c, i) => {
			const n = i * 3;			
			a[n] = c.r / 255;
			a[n + 1] = c.g / 255;
			a[n + 2] = c.b / 255;
			return a;
		}, new Float32Array(3 + nNumbers));
		
		colors[nNumbers] = origColor.r / 255;
		colors[nNumbers + 1] = origColor.g / 255;
		colors[nNumbers + 2] = origColor.b / 255;

		const material = new LineBasicMaterial({
			vertexColors: VertexColors,
		});
		const orbitGeom = this.geometry = new BufferGeometry();

		orbitGeom.addAttribute('position', new BufferAttribute(pos, 3));
		
		orbitGeom.addAttribute('color', new BufferAttribute(colors, 3));

		return new Line(orbitGeom, material);
	},

	buildPositions() {
		for (let i = 0; i < this.nVertices; i++) {
			const v = this.orbitVertices[i];
			const n = i * 3;
			this.positions[n] = v.x;
			this.positions[n + 1] = v.y;
			this.positions[n + 2] = v.z;
		}
	},

	setLine(orbitVertices) {
		this.line = this.isSolid ? this.createSolidLine(orbitVertices) : this.createGradientLine(orbitVertices);
	},

	updatePos(pos) {

		const distToLast = pos.distanceTo(this.orbitVertices[0]);
		this.geometry.attributes.position.needsUpdate = true;
		
		if (this.distToLast && this.distToLast < distToLast) {
			const sorted = [];
			for (let inc = 0, index = 1; inc < this.nVertices; inc++, index++) {
				if (index === this.nVertices) index = 0;
				// console.log('shift', inc, index);
				sorted[inc] = this.orbitVertices[index];
			}
			this.orbitVertices[this.nVertices - 1] = new Vector3(this.positions[this.nPos], this.positions[this.nPos + 1], this.positions[this.nPos + 2]);
			this.orbitVertices = sorted;
			this.buildPositions();
		}
		this.distToLast = distToLast;
		this.positions[this.nPos] = pos.x;
		this.positions[this.nPos + 1] = pos.y;
		this.positions[this.nPos + 2] = pos.z;

		
	},


	findClosest(pos, startIndex = 1) {

		//look forward & backwards
		const closests = [1, -1].map((direction) => {
			let closest;
			for (let inc = 0, index = startIndex; inc < this.nVertices; inc++, index += direction) {
				if (index === this.nVertices) index = 0;
				if (index === -1) index += this.nVertices;
				const dist = pos.distanceTo(this.orbitVertices[index]);
				// console.log(direction, index, dist);
				if (closest && dist > closest.dist) {
					break;
				}
				closest = { index, dist }; 
			}
			return closest;
		}, {});
		// console.log(closest);

		//Au tour suivant, si celui qui était le plus proche s'est rapproché on recalcule

		if (closests[0].dist < closests[1].dist) return closests[0];
		return closests[1];
	},

	hasPassedLast(pos) {
		return this.orbitVertices.reduce((carry, cur, i) => {
			const dist = pos.distanceTo(cur);
			if (!carry || dist < carry.dist) {
				return { i, dist };
			}
			return carry;
		}, null);
	},

	getDisplayObject() {
		return this.line;
	},

};
