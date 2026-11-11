import type { Vector3 } from 'three';
import OrbitLine from './OrbitLine';
import { DAY } from '../../core/constants';
import type Body3D from '../Body3d';
import type CelestialBody from '../../core/CelestialBody';

/** The orbit line (and ecliptic) of a body */
export default class BodyOrbitLines {
	isForceSolidLines: boolean;
	body3d: Body3D;
	celestial: CelestialBody;
	orbitLine?: OrbitLine;
	eclipticLine?: OrbitLine;
	computeVerticesInDeltaT?: (n: number) => Vector3[];

	constructor(body3d: Body3D, isForceSolidLines: boolean) {
		this.isForceSolidLines = isForceSolidLines;
		this.body3d = body3d;
		this.celestial = body3d.celestial;
		this.setOrbitLines();

		//retrieves n vertices to draw orbit points since last tick. Needed for pertrbed orbits, whose path changes for each revolution
		if (this.celestial.useCustomComputation) {
			this.computeVerticesInDeltaT = (n) => {
				const dt = this.celestial.universe.getTickerDeltaT() / DAY;
				const startJd = this.celestial.currentJD - dt;
				const inc = dt / n;
				const v: Vector3[] = [];
				for (let i = 0; i < n; i++) {
					const jd = startJd + (i * inc);
					v.push(this.celestial.calculatePosition(jd));
				}
				return v;
			};
		}
	}

	getName() {
		return this.body3d.getName();
	}

	setOrbitLines() {
		const orbitVertices = this.celestial.getOrbitVertices(this.celestial.showSolidOrbit);
		if (orbitVertices) {
			//get orbit line calculated from precise locations instead of assumed ellipse
			if (!this.orbitLine) {
				//if body is tracing its path as well as showing its computed orbit, we show the orbit as a solid faded line
				this.orbitLine = new OrbitLine(this.celestial.name, this.celestial.color!, this.celestial.showSolidOrbit || this.isForceSolidLines);
			}
			this.orbitLine.setLine(orbitVertices);

			//does this body revolves around the system's main body? If so, draw its ecliptic
			const central = this.celestial.universe.getBody();
			if (!this.celestial.relativeTo || this.celestial.relativeTo === central.name) {
				const eclipticVertices = orbitVertices.map(val => val.clone().negate());
				if (!this.eclipticLine) {
					this.eclipticLine = new OrbitLine(this.celestial.name, central.color!, true);
				}
				this.eclipticLine.setLine(eclipticVertices);
			}

			//if this body's orbit is heavily perturbed, we recompute the path at each revolution
			if (this.celestial.useCustomComputation && this.celestial.showSolidOrbit) {
				this.celestial.setOnRevolution(() => this.recalculateOrbitLine(false));
			}
		}
	}

	recalculateOrbitLine(isForced: boolean) {
		if (!isForced && !this.celestial.useCustomComputation) return;
		const orbitVertices = this.celestial.getOrbitVertices(this.celestial.showSolidOrbit);
		if (orbitVertices && this.orbitLine) {
			const wasAdded = this.orbitLine.added;
			this.hideOrbit();
			this.orbitLine.setLine(orbitVertices);
			if (wasAdded) {
				this.showOrbit();
			}
		}
	}

	showEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = true;
		this.body3d.getDisplayObject().add(this.eclipticLine.getDisplayObject());
	}

	hideEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = false;
		this.body3d.getDisplayObject().remove(this.eclipticLine.getDisplayObject());
	}

	showOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = true;
		this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
	}

	hideOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = false;
		this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
	}

	//the orbit is drawn around the main body OR the universe (scene)
	getOrbitContainer() {
		const thisCentralBody = this.body3d.getTraceRelativeToBody();
		return (thisCentralBody && thisCentralBody.body3d && thisCentralBody.body3d.getDisplayObject()) || this.body3d.scene.getRoot();
	}

	draw(pos: Vector3) {
		if (this.orbitLine && this.orbitLine.added && this.orbitLine.isGradient) {
			this.orbitLine.updatePos(pos, this.celestial.getRelativeVelocity(), this.computeVerticesInDeltaT);
		}
	}

	getVertices() {
		return this.orbitLine && this.orbitLine.orbitVertices;
	}

	kill() {
		this.celestial.setOnRevolution(null);
	}
}
