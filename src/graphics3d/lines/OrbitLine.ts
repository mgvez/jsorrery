import { LineBasicMaterial, BufferGeometry, Line, BufferAttribute, type Vector3 } from 'three';
import * as Dimensions from '../Dimensions';
import * as DebugPoint from '../utils/DebugPoint';
import { darken, hexToRgb, rgbToHex } from '../../utils/ColorUtils';
import { IS_SCREENSHOT, IS_CAPTURE, QUARTER_CIRCLE } from '../../core/constants';

/**
 The line of a body's orbit. Either a solid line, or a gradient that fades behind the body and follows it.
 */
export default class OrbitLine {
	name: string;
	added = false;
	isSolid: boolean;
	isGradient: boolean;
	color: string;
	orbitVertices: Vector3[] = [];
	nVertices = 0;
	nPos = 0;
	positions?: Float32Array;
	geometry?: BufferGeometry;
	declare line: Line;

	constructor(name: string, color: string, isSolid?: boolean) {
		this.name = name;
		this.isSolid = !!isSolid;
		this.isGradient = !isSolid;
		this.color = color;
	}

	createSolidLine(orbitVertices: Vector3[]) {
		const material = new LineBasicMaterial({
			color: IS_SCREENSHOT || IS_CAPTURE ? this.color : rgbToHex(darken(hexToRgb(this.color)!, 0.5)),
		});
		this.orbitVertices = orbitVertices.map(val => Dimensions.getScaled(val.clone()));
		const orbitGeom = new BufferGeometry().setFromPoints(this.orbitVertices);

		return new Line(orbitGeom, material);
	}

	createGradientLine(orbitVertices: Vector3[]) {
		const l = orbitVertices.length;
		this.orbitVertices = orbitVertices.map((val) => {
			return Dimensions.getScaled(val.clone());
		});

		this.nVertices = this.orbitVertices.length;

		const nNumbers = this.nPos = l * 3;

		const pos = this.positions = new Float32Array(3 + nNumbers);
		this.buildPositions();

		pos[nNumbers] = this.orbitVertices[0].x;
		pos[nNumbers + 1] = this.orbitVertices[0].y;
		pos[nNumbers + 2] = this.orbitVertices[0].z;

		const origColor = hexToRgb(this.color)!;
		const colors = orbitVertices.map((_v, i) => {
			return darken(origColor, 1 - i / l);
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
			vertexColors: true,
		});
		const orbitGeom = this.geometry = new BufferGeometry();

		orbitGeom.setAttribute('position', new BufferAttribute(pos, 3));
		orbitGeom.setAttribute('color', new BufferAttribute(colors, 3));

		return new Line(orbitGeom, material);
	}

	buildPositions() {
		const positions = this.positions!;
		for (let i = 0; i < this.nVertices; i++) {
			const v = this.orbitVertices[i];
			const n = i * 3;
			positions[n] = v.x;
			positions[n + 1] = v.y;
			positions[n + 2] = v.z;
		}
	}

	setLine(orbitVertices: Vector3[]) {
		this.line = this.isSolid ? this.createSolidLine(orbitVertices) : this.createGradientLine(orbitVertices);
	}

	showAllVertices() {
		DebugPoint.removeAll();
		this.orbitVertices.forEach(v => DebugPoint.add(v, 0xaaaaaa, 0.01));
	}

	updatePos(pos: Vector3, vel: Vector3, getNewVertices?: (n: number) => Vector3[]) {
		const numberBehind = this.getNVerticesBehindPos(pos, vel);
		this.geometry!.attributes.position.needsUpdate = true;
		const positions = this.positions!;

		if (numberBehind) {
			//if orbit is heavily perturbed, we'll have a callback to gen new orbit vertices when we delete some
			const newVertices = getNewVertices && getNewVertices(numberBehind).map(val => Dimensions.getScaled(val));

			const sorted: Vector3[] = [];
			let verticesDeck = this.orbitVertices;
			for (let inc = 0, index = numberBehind; inc < this.nVertices; inc++, index++) {
				if (index === this.nVertices) {
					index = 0;
					//if we have new vertices, add them at the end of array. Otherwise, shift the ones from the beginning of the exting ones.
					verticesDeck = newVertices || this.orbitVertices;
				}
				sorted[inc] = verticesDeck[index];
			}
			if (!newVertices) {
				const startVertex = sorted[this.nVertices - 2];
				const dumpedVertex = sorted[this.nVertices - 1];
				const vLen = startVertex.distanceTo(dumpedVertex);
				const newVertex = pos.clone().sub(startVertex).setLength(vLen).add(startVertex);
				sorted[this.nVertices - 1] = newVertex;
			}

			this.orbitVertices = sorted;
			this.buildPositions();
		}

		positions[this.nPos] = pos.x;
		positions[this.nPos + 1] = pos.y;
		positions[this.nPos + 2] = pos.z;
	}

	getNVerticesBehindPos(pos: Vector3, vel: Vector3) {
		const lookAway = vel.negate();

		for (let i = 0; i < this.nVertices; i++) {
			const vertex = this.orbitVertices[i];
			const diff = vertex.clone().sub(pos);
			const angle = diff.angleTo(lookAway);
			//point is not behind. If this happens, we assume that all that came before are behind, since the count starts from begining of line, where the planet was at previous frame. It means though that the planet cannot move more than half a circle per tick.
			if (angle >= QUARTER_CIRCLE) {
				return i;
			}
		}
		return null;
	}

	getDisplayObject() {
		return this.line;
	}
}
