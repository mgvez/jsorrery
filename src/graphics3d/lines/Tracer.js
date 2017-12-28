
import { Vector3, Object3D, LineBasicMaterial, Geometry, Line } from 'three';
import { darken, hexToRgb, rgbToHex } from '../../utils/ColorUtils';
import { IS_SCREENSHOT, IS_CAPTURE } from '../../core/constants';

//a change of direction of x radians triggers a vertex switch in the path (equivalent to adding a vertex);
const SWITCH_TRESHOLD = 0.005;
const vNorm = new Vector3(1, 0, 0);

export default class Tracer {
	constructor(color, nVertices, name) {
		this.name = name;
		this.color = IS_SCREENSHOT || IS_CAPTURE ? color : rgbToHex(darken(hexToRgb(color), 0.7));
		this.points = [];
		this.nVertices = nVertices;
		this.lastVertexIdx = this.nVertices - 1;
		this.lastMod = 0;
		this.root = new Object3D();
		this.tracePosition = new Vector3();
	}

	getDisplayObject() {
		return this.root;
	}

	getNew() {
		
		this.detachTrace();

		const material = new LineBasicMaterial({
			color: this.color,
			lineWidth: 4,
		});

		this.geom = new Geometry();
		for (let i = 0; i < this.nVertices; i++) {
			this.geom.vertices.push(new Vector3(0, 0, 0));
		}
		this.line = new Line(this.geom, material);
		this.line.frustumCulled = false;
		this.currentVertex = 0;
		this.initCallback = this.changeVertex.bind(this);
		this.attachTrace();
	}

	detachTrace() {
		if (this.line) this.root.remove(this.line);
	}

	attachTrace() {
		if (this.line) this.root.add(this.line);
	}

	setTraceFrom(traceFromBody) {
		if (this.traceFrom !== traceFromBody) this.getNew();
		this.traceFrom = traceFromBody;
		if (!traceFromBody) {
			this.root.position.set(0, 0, 0);
		}
	}

	changeVertex() {
		this.lastPathDirection = null;
		this.switchVertex = this.currentVertex === this.lastVertexIdx;
		if (this.currentVertex < this.lastVertexIdx) this.currentVertex++;
	}

	draw(fromPos) {
		if (!this.geom) return;
		const pos = this.setTracePos(fromPos);
		if (this.geom.vertices[this.currentVertex] && this.geom.vertices[this.currentVertex].distanceTo(pos) === 0) return;
		this.geom.verticesNeedUpdate = true;
		
		if (this.currentVertex < this.lastVertexIdx) {
			for (let i = this.currentVertex; i < this.nVertices; i++) {
				this.geom.vertices[i].copy(pos);
			}
		} else {
			if (this.switchVertex) {
				for (let i = 0; i < this.lastVertexIdx; i++) {
					this.geom.vertices[i].copy(this.geom.vertices[i + 1]);
				}
				this.switchVertex = false;
			}
			this.geom.vertices[this.lastVertexIdx].copy(pos);
		}

		const v2 = this.geom.vertices[this.currentVertex - 2]; 
		const v1 = this.geom.vertices[this.currentVertex - 1]; 
		const v0 = this.geom.vertices[this.currentVertex];
		
		if (v1 && v2) {

			if (!this.lastPathDirection) {
				const a = v1.clone().sub(v2);
				this.lastPathDirection = Math.abs(a.angleTo(vNorm));
			}
			const curPath = v0.clone().sub(this.previousPos);
			const diff = Math.abs(this.lastPathDirection - Math.abs(curPath.angleTo(vNorm)));
			if (diff > SWITCH_TRESHOLD) {
				this.changeVertex();
			}

		}

		if (!v1 || !v2) {
			this.changeVertex();
		}
		this.previousPos = pos;
					
	}

	setTracePos(pos) {
		if (this.traceFrom) {
			this.root.position.copy(this.traceFrom.getPosition());
			pos.sub(this.traceFrom.getPosition());
		}
		return pos;
	}

};
