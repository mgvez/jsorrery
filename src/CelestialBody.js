
import { Vector3 } from 'three';
import OrbitalElements from 'algorithm/OrbitalElements';
import { J2000, RAD_TO_DEG, CIRCLE } from 'constants';
import { getUniverse } from 'JSOrrery';

export default {
	init() {
		this.reset();
		this.movement = new Vector3();
		this.invMass = 1 / this.mass;

		this.orbitalElements = Object.create(OrbitalElements);
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setDefaultOrbit(this.orbit, this.orbitCalculator, this.positionCalculator);
		//console.log(this.name, this.position, this.velocity);
	},

	reset() {
		this.angle = 0;
		this.force = new Vector3();
		this.movement = new Vector3();
		this.previousPosition = null;
	},

	//if epoch start is not j2000, get epoch time from j2000 epoch time
	getEpochTime(epochTime) {
		if (this.epoch) {
			return epochTime - ((this.epoch.getTime() - J2000) / 1000);
		}
		return epochTime;
	},

	setPositionFromDate(epochTime) {
		const currentEpochTime = this.currentEpochTime = this.getEpochTime(epochTime);
		this.position = this.isCentral ? new Vector3() : this.orbitalElements.calculatePosition(currentEpochTime);

		this.relativePosition = this.position.clone();
		// console.log(this.relativePosition);
		this.absvelocity = null;
		this.relvelocity = null;
	},
	
	getAngleTo(bodyName) {
		const ref = getUniverse().getBody(bodyName);
		if (ref) {
			
			const eclPos = this.position.clone().sub(ref.getPosition()).normalize();
			eclPos.z = 0;
			const angleX = eclPos.angleTo(new Vector3(1, 0, 0));
			const angleY = eclPos.angleTo(new Vector3(0, 1, 0));
			//console.log(angleX, angleY);
			let angle = angleX;
			const q = Math.PI / 2;
			if (angleY > q) angle = -angleX;
			return angle;
		}
		return 0;
	},

	afterInitialized(isSetRelativeTo) {
		// console.log(this.title);
		if (isSetRelativeTo) {
			this.previousRelativePosition = this.position.clone();
			this.positionRelativeTo();
		}
		if (this.customInitialize) this.customInitialize();
		
		if (this.customAfterTick) this.customAfterTick(getUniverse().epochTime, getUniverse().date);
	},

	positionRelativeTo() {
		if (this.relativeTo) {

			const central = getUniverse().getBody(this.relativeTo);
			if (central && central !== getUniverse().getBody()/**/) {
				this.position.add(central.position);
				// console.log(this.name + ' pos rel to ' + this.relativeTo);
				this.addToAbsoluteVelocity(central.getAbsoluteVelocity());
			}
		}
	},

	//gets current rotation of body around its axis
	getCurrentRotation() {
		return (getUniverse().currentTime / this.sideralDay + (this.zeroTime || 0)) * CIRCLE;
	},

	beforeMove() {},
	afterMove() {},

	/**
	Calculates orbit line from orbital elements.
	isFuture indicate if we want the elements for future orbit or for passed orbit (it changes for perturbed orbits)
	*/
	getOrbitVertices(isFuture) {

		const startTime = this.getEpochTime(getUniverse().currentTime);
		const elements = this.orbitalElements.calculateElements(startTime);
		const period = this.orbitalElements.calculatePeriod(elements, this.relativeTo);

		if (!period) return null;

		const incr = period / 360;
		const points = [];
		let lastPoint;
		let point;
		let angle;
		let step;
		let total = 0;
		let angleToPrevious;
		const multiplyer = isFuture ? 1 : -1;
		const arrayAction = isFuture ? 'push' : 'unshift';
		for (let i = 0; total < 360; i++) {
			// console.log(total);
			
			point = this.calculatePosition(startTime + (multiplyer * incr * i));
			// if (this.name === 'moon') console.log('inc', startTime, (multiplyer * incr * i));

			if (lastPoint) {
				// if (this.name === 'moon') throw new Error('ok');
				angle = point.angleTo(lastPoint) * RAD_TO_DEG;
				//make sure we do not go over 360.5 
				if (angle > 1.3 || ((angle + total) > 360.5)) {
					for (let j = 0; j < angle; j++) {
						step = (incr * (i - 1)) + ((incr / angle) * j);
						point = this.calculatePosition(startTime + (multiplyer * step));
						
						//when finishing the circle try to avoid going too far over 360 (break after first point going over 360)
						if (total > 358) {
							angleToPrevious = point.angleTo(points[0]) * RAD_TO_DEG;
							if ((angleToPrevious + total) > 360) {
								points[arrayAction](point);
								break;
							} 
						}

						points[arrayAction](point);
						
					}
					total += point.angleTo(lastPoint) * RAD_TO_DEG;
					lastPoint = point;
					continue;
				}
				total += angle;					
			}
			points[arrayAction](point);
			lastPoint = point;
		}
		return points;
	},
	
	afterTick(deltaT, isPositionRelativeTo) {
		if (!this.isCentral) {

			if (isPositionRelativeTo) {
				this.positionRelativeTo();
			}

			const relativeToPos = getUniverse().getBody(this.relativeTo).getPosition();
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
		if (this.customAfterTick) this.customAfterTick(getUniverse().epochTime, getUniverse().date, deltaT);

	},

	setOnRevolution(cb) {
		this.onRevolution = cb;
	},

	calculatePosition(t, isApproximate) {
		return this.orbitalElements.calculatePosition(t, isApproximate);
	},

	getPosition() {
		return this.position.clone();
	},

	getRelativePosition() {
		return this.relativePosition.clone();
	},

	setVelocity(v) {
		this.absvelocity = v;
		this.relvelocity = v.clone();
	},

	addToAbsoluteVelocity(v) {
		if (!v) return;
		this.absvelocity = this.absvelocity || this.getRelativeVelocity();
		this.absvelocity.add(v);
	},

	//absolute velocity
	getAbsoluteVelocity() {
		return (this.absvelocity && this.absvelocity.clone()) || this.getRelativeVelocity();
	},

	//velocity relative to central body for this object's orbit
	getRelativeVelocity() {
		if (this.relvelocity) return this.relvelocity.clone();
		this.relvelocity = this.isCentral ? new Vector3() : this.orbitalElements.calculateVelocity(this.currentEpochTime, this.relativeTo);
		return this.relvelocity.clone();
	},
	//return true/false if this body is orbiting the requested body
	isOrbitAround(celestial) {
		return celestial.name === this.relativeTo;
	},
};
