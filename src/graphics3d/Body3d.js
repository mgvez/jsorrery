
import { Object3D, MeshPhongMaterial, Mesh, SphereGeometry, MeshLambertMaterial, DoubleSide } from 'three';
import RingGeometry2 from 'three/RingGeometry2';
import Labels from 'graphics2d/Labels';
import ResourceLoader from 'loaders/ResourceLoader';
import Dimensions from 'graphics3d/Dimensions';
import { KM, DEG_TO_RAD, RAD_TO_DEG, CIRCLE } from 'constants';
import { getUniverse } from 'JSOrrery';
import Gui from 'gui/Gui';

export default {

	init(celestialBody) {
		this.root = new Object3D();
		this.celestial = celestialBody;
		//max delta T to show rotation. If deltaT is larger than that, planet would spin too fast, so don't show sideral day
		this.maxDeltaForSideralDay = this.celestial.sideralDay && this.celestial.sideralDay / 20;

		this.setPlanet();

		//make this display object available from the celestial body
		this.celestial.getBody3D = () => {
			return this;
		};

		Labels.addPlanetLabel(this.celestial.title || this.celestial.name, this);
	},

	addEventLabel() {},

	getDisplayObject() {
		return this.root;
	},

	setParentDisplayObject(object3d) {
		this.parentContainer = object3d;
		this.parentContainer.add(this.root);
	},

	setTracer(tracer) {
		this.tracer = tracer;
	},

	setOrbitLines(orbitLines) {
		this.orbitLines = orbitLines;
	},

	setPlanet() {
		const map = this.celestial.map;
		const matOptions = {};
		let onMaterialReady;
		if (map) {
			onMaterialReady = ResourceLoader.loadTexture(map).then((planetMap) => {
				matOptions.map = planetMap;
				return matOptions;
			});
		} else {
			matOptions.color = this.celestial.color;
			onMaterialReady = Promise.resolve(matOptions);
		}
		this.planet = new Object3D();

		onMaterialReady.then((def) => {
			const mat = Object.assign(new MeshPhongMaterial(def), this.celestial.material || {});
			const radius = this.getPlanetSize();
			const segments = 50;
			const rings = 50;
			const sphere = new Mesh(
				new SphereGeometry(radius, segments, rings),
				mat
			);
			//console.log(this.celestial.name+' size ',radius, ' m');
			this.planet.add(sphere);
		});

		if (this.celestial.ring) {
			ResourceLoader.loadTexture(this.celestial.ring.map).then(ringMap => {
				const ringSize = [
					Dimensions.getScaled(this.celestial.ring.innerRadius * KM),
					Dimensions.getScaled(this.celestial.ring.outerRadius * KM),
				];
				
				const ringMaterial = new MeshLambertMaterial({
					map: ringMap,
					transparent: true,
					side: DoubleSide,
				});

				//var ringGeometry = new THREE.TorusGeometry(ringSize[1], ringSize[1] - ringSize[0], 2, 40);
				const ringGeometry = new RingGeometry2(ringSize[1], ringSize[0], 180, 1, 0, Math.PI * 2);
				ringGeometry.computeFaceNormals();

				const ring = new Mesh(ringGeometry, ringMaterial);
				ring.rotation.x = -Math.PI / 2;
				this.planet.add(ring);
			});
			
		}
		
		let tilt = Math.PI / 2;
		if (this.celestial.tilt) tilt -= this.celestial.tilt * DEG_TO_RAD;
		this.planet.rotation.x = tilt;				

		this.root.add(this.planet);
		return this.planet;
	},

	setScale(scaleVal) {
		if (this.maxScale && this.maxScale < scaleVal) return;
		this.planet.scale.set(scaleVal, scaleVal, scaleVal);
	},

	getPlanetSize() {
		return Dimensions.getScaled(this.celestial.radius * KM);
	},

	getPlanetStageSize() {
		return this.getPlanetSize() * this.planet.scale.x;
	},

	addCamera(name, camera) {
		
		this.root.add(camera);
		this.cameras = this.cameras || {};
		this.cameras[name] = camera;
	},

	getCamera(name) {
		// console.log(name);
		return this.cameras && this.cameras[name];
	},
	
	drawMove() {
		const pos = this.getPosition();
		// console.log(pos, this.celestial.name);
		this.root.position.copy(pos);

		if (this.celestial.sideralDay) {
			const curRotation = (getUniverse().currentTime / this.celestial.sideralDay) * CIRCLE;
			this.planet.rotation.y = (this.celestial.baseMapRotation || 0) + curRotation;
		}

		if (this.tracer) this.tracer.draw(pos);
		
		// if (this.celestial.name === 'moon' && this.orbitLines) this.orbitLines.draw(Dimensions.getScaled(this.celestial.getRelativePosition()));
		// if (this.orbitLines) this.orbitLines.draw(pos);
		if (this.orbitLines) this.orbitLines.draw(Dimensions.getScaled(this.celestial.getRelativePosition()));
		return pos;
	},

	getScreenSizeRatio(camPos, fov) {
		const sz = this.getPlanetStageSize();
		//console.log(this.planet.scale.x);
		const dist = this.getPosition().sub(camPos).length();

		const height = 2 * Math.tan((fov * DEG_TO_RAD) / 2) * dist; // visible height, see http://stackoverflow.com/questions/13350875/three-js-width-of-view/13351534#13351534
		return sz / height;
	},

	getPosition(pos) {
		const curPosition = (pos && pos.clone()) || this.celestial.getPosition();
		return Dimensions.getScaled(curPosition);
	},

	getName() {
		return this.celestial.name;
	},
};
