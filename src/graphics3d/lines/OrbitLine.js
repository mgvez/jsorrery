

import { LineBasicMaterial, BufferGeometry, Geometry, Line, BufferAttribute, VertexColors, Vector3 } from 'three';
import Dimensions from 'graphics3d/Dimensions';
import DebugPoint from 'graphics3d/utils/DebugPoint';
import { darken, hexToRgb, rgbToHex } from 'utils/ColorUtils';
import { IS_SCREENSHOT, IS_CAPTURE } from 'constants';
import { getUniverse } from 'JSOrrery';


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

	showAllVertices() {
		DebugPoint.removeAll();
		this.orbitVertices.forEach(v => DebugPoint.add(v, 0xaaaaaa));
	},

	updatePos(pos, vel) {

		const numberBehind = this.getNVerticesBehindPos(pos);
		this.geometry.attributes.position.needsUpdate = true;
		
		if (numberBehind) {
			const sorted = [];
			for (let inc = 0, index = numberBehind; inc < this.nVertices; inc++, index++) {
				if (index === this.nVertices) index = 0;
				sorted[inc] = this.orbitVertices[index];
			}
			const startVertex = sorted[this.nVertices - 2];
			const dumpedVertex = sorted[this.nVertices - 1];
			const vLen = startVertex.distanceTo(dumpedVertex);
			const newVertex = pos.clone().sub(startVertex).setLength(vLen).add(startVertex);
			// DebugPoint.add(newVertex, 0xffffaa);
			
			sorted[this.nVertices - 1] = newVertex;
			this.orbitVertices = sorted;
			// this.showAllVertices();
			this.buildPositions();
		}

		this.positions[this.nPos] = pos.x;
		this.positions[this.nPos + 1] = pos.y;
		this.positions[this.nPos + 2] = pos.z;

	},
	

	getNVerticesBehindPos(pos, vel) {
		let current;
		let previous1;
		let previous2;
		// console.log('----');
		for (let i = 0; i < this.nVertices; i++) {
			// console.log(i);
			const vertex = this.orbitVertices[i];
			const dist = pos.distanceTo(vertex);
			const data = { i, dist, vertex };

			previous2 = previous1;
			previous1 = current;
			current = data;

			//we need at least 2
			if (!previous1) continue;
			// DebugPoint.removeAll();
			//distance begins to rise. We are past our vertex. It's either the previous one or the one before.
			if (dist > previous1.dist) {
				if (previous2) {
					
					// console.log(i);
					// console.clear();
					// console.log(previous2.dist);
					// console.log(previous1.dist);
					// console.log(current.dist);
					// console.log(i + 1);
					if (previous2.dist < current.dist) {
						// DebugPoint.add(previous2.vertex, 0x55ff00);
						// DebugPoint.add(previous1.vertex, 0x777777);
						// DebugPoint.add(current.vertex, 0x777777);
						// getUniverse().stop(true);
						return previous2.i + 1;
					}
					// DebugPoint.add(previous2.vertex, 0x777777);
					// DebugPoint.add(previous1.vertex, 0xff5555);
					// DebugPoint.add(current.vertex, 0x777777);
					
					// getUniverse().stop(true);
					return previous1.i + 1;
				}
				//nearest vertex is the first one. we need to know if it's behind our pos. If so, pos's distance is further than previous to current
				if (dist < previous1.vertex.distanceTo(vertex)) {
					// DebugPoint.add(previous1.vertex, 0x0055ff);
					// DebugPoint.add(current.vertex, 0x777777);
					// getUniverse().stop(true);
					return previous1.i + 1;
				}
				// console.log('first behind');
				return null;
			}
		}
		// console.log('none');
		return null;
	},

	getDisplayObject() {
		return this.line;
	},

};
