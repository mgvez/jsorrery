import { Vector3, Euler } from 'three';
import OrbitalElements from '../algorithm/OrbitalElements';
import { RAD_TO_DEG, CIRCLE, DAY, J2000 } from './constants';
import type { BodyDefinition } from '../scenario/types';
import type Simulation from './Simulation';
import type Body3D from '../graphics3d/Body3d';

/**
 A body of the simulation (star, planet, satellite, spacecraft...). Its definition (from a scenario) is merged into the
 instance, so that scenario files can add properties and override methods (getTilt, customAfterTick, etc.).
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class CelestialBody {
	declare name: string;
	declare universe: Simulation;
	declare orbitalElements: OrbitalElements;
	/** the 3d representation of this body, when it is displayed in a scene */
	declare body3d?: Body3D;

	/** position (m) relative to the universe */
	declare position: Vector3;
	/** position (m) relative to the body this one is relative to */
	declare relativePosition: Vector3;
	declare previousRelativePosition: Vector3;
	declare lastPos: Vector3;
	declare previousPosition: Vector3 | null;
	/** gravitational force applied on this body (N) */
	declare force: Vector3;
	/** displacement during the last tick (m) */
	declare movement: Vector3;
	declare invMass: number;
	declare angle: number;
	declare speed: number;
	declare currentJD: number;
	declare absvelocity: Vector3 | null;
	declare relvelocity: Vector3 | null;
	declare onRevolution: (() => void) | null;
	/** moon: next time (J2000 seconds) its map orientation is checked */
	declare nextCheck?: number;

	constructor(definition: BodyDefinition & { name: string }) {
		Object.assign(this, definition);
	}

	init(universe: Simulation) {
		this.reset();
		this.movement = new Vector3();
		this.invMass = 1 / this.mass;
		this.universe = universe;

		this.orbitalElements = new OrbitalElements();
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setRelativeTo(this.universe.getBody(this.relativeTo));
		this.orbitalElements.setDefaultOrbit(this.orbit, this.osculatingElementsCalculator, this.positionCalculator);

		//we normally use regular precision for computing position, but in certain cases, bodies have a very precise position calculation, but it is slow. We use it only when needed, that is when we are observing a body from another one (e.g. to see eclipses)
		this.maxPrecision = this.maxPrecision || false;
	}

	reset() {
		this.angle = 0;
		this.force = new Vector3();
		this.movement = new Vector3();
		this.previousPosition = null;
	}

	setPositionFromJD(jd: number, isDbg?: boolean) {
		this.currentJD = jd;
		// NOTE: when neither flag is true this passes `undefined`, so calculatePosition() falls back to its default
		// (maximum precision). This is how jsOrrery has always behaved; it is kept as is so that positions don't change.
		const precision = this.maxPrecision || this.forceMaxPrecision;
		this.position = this.isCentral ? new Vector3() : this.orbitalElements.calculatePosition(jd, precision, isDbg);

		this.relativePosition = this.position.clone();

		this.lastPos = this.position.clone();
		this.absvelocity = null;
		this.relvelocity = null;
		return this.position;
	}

	getAngleTo(bodyName: string) {
		const ref = this.universe.getBody(bodyName);
		if (ref) {
			const eclPos = this.position.clone().sub(ref.getPosition()).normalize();
			eclPos.z = 0;
			const angleX = eclPos.angleTo(new Vector3(1, 0, 0));
			const angleY = eclPos.angleTo(new Vector3(0, 1, 0));
			let angle = angleX;
			const q = Math.PI / 2;
			if (angleY > q) angle = -angleX;
			return angle;
		}
		return 0;
	}

	afterInitialized(isSetRelativeTo: boolean) {
		if (isSetRelativeTo) {
			this.previousRelativePosition = this.position.clone();
			this.positionRelativeTo();
		}
		if (this.customInitialize) this.customInitialize();

		if (this.customAfterTick) this.customAfterTick(0);
	}

	positionRelativeTo() {
		if (this.relativeTo) {
			const central = this.universe.getBody(this.relativeTo);
			if (central && central !== this.universe.getBody()) {
				this.position.add(central.position);
				this.addToAbsoluteVelocity(central.getAbsoluteVelocity());
			}
		}
	}

	//gets current rotation of body around its axis
	getCurrentRotation() {
		const rot = ((this.universe.getCurrentJD() - J2000) / ((this.siderealDay ?? 0) / DAY));
		const rotCorr = (this.getRotationCorrection && this.getRotationCorrection()) || 0;
		return (rot + rotCorr) * CIRCLE;
	}

	//returns euler angle of tilt (default if none set in scenario)
	getTilt(xCorr?: number) {
		return new Euler(xCorr, 0, 0, 'YZX');
	}

	beforeMove(_deltaT: number) {}
	afterMove(_deltaT: number) {}

	/**
	Calculates orbit line from orbital elements.
	isFuture indicate if we want the elements for future orbit or for passed orbit (it changes for perturbed orbits)
	*/
	getOrbitVertices(isFuture?: boolean) {
		const startTime = this.currentJD;
		const elements = this.orbitalElements.calculateElements(startTime);
		const period = this.orbitalElements.calculatePeriod(elements);

		if (!period) return null;

		const incr = period / 360;
		const points: Vector3[] = [];
		let lastPoint: Vector3 | undefined;
		let point: Vector3;
		let angle: number;
		let step: number;
		let total = 0;
		let angleToPrevious: number;
		const multiplyer = isFuture ? 1 : -1;
		const addPoint = (p: Vector3) => (isFuture ? points.push(p) : points.unshift(p));
		for (let i = 0; total < 360; i++) {
			const t = startTime + (multiplyer * incr * i) / DAY;
			point = this.calculatePosition(t);

			if (lastPoint) {
				angle = point.angleTo(lastPoint) * RAD_TO_DEG;
				//make sure we do not go over 360.5
				if (angle > 1.3 || ((angle + total) > 360.5)) {
					for (let j = 0; j < angle; j++) {
						step = (incr * (i - 1)) + ((incr / angle) * j);
						point = this.calculatePosition(startTime + (multiplyer * step) / DAY);

						//when finishing the circle try to avoid going too far over 360 (break after first point going over 360)
						if (total > 358) {
							angleToPrevious = point.angleTo(points[0]) * RAD_TO_DEG;
							if ((angleToPrevious + total) > 360) {
								addPoint(point);
								break;
							}
						}

						addPoint(point);
					}
					total += point.angleTo(lastPoint) * RAD_TO_DEG;
					lastPoint = point;
					continue;
				}
				total += angle;
			}
			addPoint(point);
			lastPoint = point;
		}
		return points;
	}

	afterTick(deltaT: number, isPositionRelativeTo: boolean) {
		if (!this.isCentral) {
			if (isPositionRelativeTo) {
				this.positionRelativeTo();
			}

			const relativeToPos = this.universe.getBody(this.relativeTo).getPosition();
			this.relativePosition.copy(this.position).sub(relativeToPos);
			this.movement.copy(this.relativePosition).sub(this.previousRelativePosition);
			this.speed = this.movement.length() / deltaT;
			this.angle += this.relativePosition.angleTo(this.previousRelativePosition);
			this.previousRelativePosition.copy(this.relativePosition);

			if (this.angle > CIRCLE) {
				this.angle = this.angle % CIRCLE;
				if (this.onRevolution) this.onRevolution();
			}
		}
		if (this.customAfterTick) this.customAfterTick(deltaT);
	}

	setOnRevolution(cb: (() => void) | null) {
		this.onRevolution = cb;
	}

	calculatePosition(jd: number, maxPrecision?: boolean) {
		return this.orbitalElements.calculatePosition(jd, maxPrecision);
	}

	getPosition() {
		return this.position.clone();
	}

	getRelativePosition() {
		return this.relativePosition.clone();
	}

	setVelocity(v: Vector3) {
		this.absvelocity = v;
		this.relvelocity = v.clone();
	}

	addToAbsoluteVelocity(v: Vector3 | null | undefined) {
		if (!v) return;
		this.absvelocity = this.absvelocity || this.getRelativeVelocity();
		this.absvelocity.add(v);
	}

	//absolute velocity
	getAbsoluteVelocity() {
		return (this.absvelocity && this.absvelocity.clone()) || this.getRelativeVelocity();
	}

	//velocity relative to central body for this object's orbit
	getRelativeVelocity() {
		if (this.relvelocity) return this.relvelocity.clone();
		this.relvelocity = this.isCentral ? new Vector3() : this.orbitalElements.calculateVelocity(this.currentJD);
		return this.relvelocity.clone();
	}

	//return true/false if this body is orbiting the requested body
	isOrbitAround(celestial: CelestialBody) {
		return celestial.name === this.relativeTo;
	}

	kill() {
		this.body3d = undefined;
	}
}

// the scenario definition is merged in the instance: expose its properties on the type
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging, @typescript-eslint/no-empty-object-type
interface CelestialBody extends Omit<BodyDefinition, 'name' | 'getTilt' | 'beforeMove' | 'afterMove'> {}

export default CelestialBody;
