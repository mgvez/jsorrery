
import { EventDispatcher, Vector3 } from 'three';
import OrbitalElements from 'algorithm/OrbitalElements';
import { J2000, DEG_TO_RAD, RAD_TO_DEG, DAY, YEAR, CIRCLE } from 'constants';
import { getUniverse } from 'JSOrrery';

export default Object.assign(Object.create(EventDispatcher.prototype), {
	init() {
		this.reset();
		this.movement = new Vector3();
		this.invMass = 1 / this.mass;

		this.orbitalElements = Object.create(OrbitalElements);
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setDefaultOrbit(this.orbit, this.orbitCalculator);
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

	setPositionFromDate(epochTime, calculateVelocity) {
		// console.log(epochTime);
		const realEpochTime = this.getEpochTime(epochTime);
		this.position = this.isCentral ? new Vector3() : this.orbitalElements.getPositionFromElements(this.orbitalElements.calculateElements(realEpochTime));
		this.relativePosition = new Vector3();
		// if (calculateVelocity) {
		this.velocity = this.isCentral ? new Vector3() : this.orbitalElements.calculateVelocity(realEpochTime, this.relativeTo, this.calculateFromElements);
		// }
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
				//console.log(this.name+' pos rel to ' + this.relativeTo);
				if (this.velocity && central.velocity) this.velocity.add(central.velocity);
			}
		}
	},

	beforeMove(deltaTIncrement) {},
	afterMove(deltaTIncrement) {},

	/**
	Calculates orbit line from orbital elements.
	*/
	getOrbitVertices() {

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
		let computed;
		let angleToPrevious;

		for (let i = 0; total < 360; i++) {
			computed = this.orbitalElements.calculateElements(startTime - (incr * i));
			//if(this.name=='moon')console.log(startTime+(incr*i));
			point = this.orbitalElements.getPositionFromElements(computed);
			if (lastPoint) {
				angle = point.angleTo(lastPoint) * RAD_TO_DEG;
				//make sure we do not go over 360.5 
				if (angle > 1.3 || ((angle + total) > 360.5)) {
					for (let j = 0; j < angle; j++) {
						step = (incr * (i - 1)) + ((incr / angle) * j);
						computed = this.orbitalElements.calculateElements(startTime - step);
						point = this.orbitalElements.getPositionFromElements(computed);
						//when finishing the circle try to avoid going too far over 360 (break after first point going over 360)
						if (total > 358) {
							angleToPrevious = point.angleTo(points[0]) * RAD_TO_DEG;
							if ((angleToPrevious + total) > 360) {
								points.unshift(point);
								break;
							} 
						}

						points.unshift(point);
						
					}
					total += point.angleTo(lastPoint) * RAD_TO_DEG;
					lastPoint = point;
					continue;
				}
				total += angle;					
			}
			points.unshift(point);
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
				this.dispatchEvent({ type: 'revolution' });
				if (this.onOrbitCompleted) this.onOrbitCompleted();
			}
		}
		if (this.customAfterTick) this.customAfterTick(getUniverse().epochTime, getUniverse().date, deltaT);

	},

	calculatePosition(t) {
		return this.orbitalElements.calculatePosition(t);
	},

	getPosition() {
		return this.position.clone();
	},

	getVelocity() {
		return this.velocity && this.velocity.clone();
	},
	//return true/false if this body is orbiting the requested body
	isOrbitAround(celestial) {
		return celestial.name === this.relativeTo;
	},
});
