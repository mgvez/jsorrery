
import OrbitLine from './OrbitLine';
import { getUniverse } from '../JSOrrery';

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
		let orbitVertices = this.celestial.getOrbitVertices(false);
		
		if (orbitVertices) {
			//get orbit line calculated from precise locations instead of assumed ellipse
			if (!this.perturbedOrbitLine) {
				this.perturbedOrbitLine = Object.create(OrbitLine);
				this.perturbedOrbitLine.init(this.celestial.name, this.celestial.color);
			}
			this.perturbedOrbitLine.setLine(orbitVertices);

			//get new orbit vertices, but elliptical (not perturbed)
			orbitVertices = this.celestial.getOrbitVertices(true);

			//does this body revolves around the system's main body? If so, draw its ecliptic
			if (!this.celestial.relativeTo || this.celestial.relativeTo === getUniverse().getBody().name) {
				const eclipticVertices = orbitVertices.map(val => val.clone().negate());
				if (!this.eclipticLine) {
					this.eclipticLine = Object.create(OrbitLine);
					this.eclipticLine.init(this.celestial.name, getUniverse().getBody().color);
				}
				this.eclipticLine.setLine(eclipticVertices);
			}/**/

			if (!this.ellipticOrbitLine) {
				this.ellipticOrbitLine = Object.create(OrbitLine);
				this.ellipticOrbitLine.init(this.celestial.name, this.celestial.color);
			}
			this.ellipticOrbitLine.setLine(orbitVertices);

			if (this.celestial.calculateFromElements) {
				this.recalculateListener = () => {
					this.recalculateOrbitLine(false);
				};
				this.celestial.addEventListener('revolution', this.recalculateListener);
			}
			this.orbitLine = this.celestial.calculateFromElements ? this.perturbedOrbitLine : this.ellipticOrbitLine;

		}
	},

	recalculateOrbitLine(isForced) {
		if (!isForced && (!this.perturbedOrbitLine || !this.celestial.calculateFromElements)) return;
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

	kill() {
		if (this.recalculateListener) this.celestial.removeEventListener('revolution', this.recalculateListener);
	},

};
