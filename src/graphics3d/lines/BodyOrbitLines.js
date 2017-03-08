
import { getUniverse } from 'JSOrrery';
import OrbitLine from 'graphics3d/lines/OrbitLine';

export default {
			
	init(body3d) {
		this.body3d = body3d;
		this.celestial = body3d.celestial;
		this.setOrbitLines();
	},

	getName() {
		return this.body3d.getName();
	},

	setOrbitLines() {
		const orbitVertices = this.celestial.getOrbitVertices(false);
		if (orbitVertices) {
			// console.log(this.celestial.name, orbitVertices.length);
			//get orbit line calculated from precise locations instead of assumed ellipse
			if (!this.orbitLine) {
				this.orbitLine = Object.create(OrbitLine);
				//if body is tracing its path as well as showing its computed orbit, we show the orbit as a solid faded line
				this.orbitLine.init(this.celestial.name, this.celestial.color, this.celestial.forceTrace);
			}
			this.orbitLine.setLine(orbitVertices);

			//does this body revolves around the system's main body? If so, draw its ecliptic
			if (!this.celestial.relativeTo || this.celestial.relativeTo === getUniverse().getBody().name) {
				const eclipticVertices = orbitVertices.map(val => val.clone().negate());
				if (!this.eclipticLine) {
					this.eclipticLine = Object.create(OrbitLine);
					this.eclipticLine.init(this.celestial.name, getUniverse().getBody().color, true);
				}
				this.eclipticLine.setLine(eclipticVertices);
			}/**/


			if (this.celestial.calculateFromElements) {
				this.recalculateListener = () => {
					this.recalculateOrbitLine(false);
				};
				this.celestial.addEventListener('revolution', this.recalculateListener);
			}

		}
	},

	recalculateOrbitLine(isForced) {
		if (!isForced && !this.celestial.calculateFromElements) return;
		//console.log('recalculate '+this.celestial.name+' perturbed:'+this.celestial.calculateFromElements);
		const orbitVertices = this.celestial.getOrbitVertices(!this.celestial.calculateFromElements);
		if (orbitVertices) {
			const wasAdded = this.orbitLine.added;
			this.hideOrbit();
			this.orbitLine.setLine(orbitVertices);
			if (wasAdded) {
				this.showOrbit();
			}
		}
	},

	showEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = true;
		this.body3d.getDisplayObject().add(this.eclipticLine.getDisplayObject());
	},

	hideEcliptic() {
		if (!this.eclipticLine) return;
		this.eclipticLine.added = false;
		this.body3d.getDisplayObject().remove(this.eclipticLine.getDisplayObject());
	},

	showOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = true;
		this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
		
		//this.getOrbitContainer().add(this.ellipticOrbitLine.getDisplayObject());
	},

	hideOrbit() {
		if (!this.orbitLine) return;
		this.orbitLine.added = false;
		this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
		//this.getOrbitContainer().remove(this.ellipticOrbitLine.getDisplayObject());
	},

	//the orbit is drawn around the main body OR the universe (scene)
	getOrbitContainer() {
		//return Universe.getScene().getRoot();
		let thisCentralBody;
		const centralName = this.celestial.traceRelativeTo || this.celestial.relativeTo;
		if (centralName) {
			thisCentralBody = getUniverse().getBody(centralName);
		}
		return (thisCentralBody && thisCentralBody.getBody3D().getDisplayObject()) || getUniverse().getScene().getRoot();
	},

	draw(pos, vel) {
		if (this.orbitLine && this.orbitLine.added && this.orbitLine.isGradient) {
			this.orbitLine.updatePos(pos, vel);
		}
	},

	kill() {
		if (this.recalculateListener) this.celestial.removeEventListener('revolution', this.recalculateListener);
	},

};
