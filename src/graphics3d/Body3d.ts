import { Object3D, MeshPhongMaterial, Mesh, SphereGeometry, MeshLambertMaterial, DoubleSide, Euler, Quaternion, type Texture, type Vector3, type MeshPhongMaterialParameters } from 'three';
import RingGeometry2 from '../three/RingGeometry2';
import * as ResourceLoader from '../loaders/ResourceLoader';
import * as Dimensions from './Dimensions';
import { KM, DEG_TO_RAD, QUARTER_CIRCLE } from '../core/constants';
import type CelestialBody from '../core/CelestialBody';
import type JSOrreryScene from './Scene';
import type BodyOrbitLines from './lines/BodyOrbitLines';
import type Tracer from './lines/Tracer';
import type { BodyCamera } from './CameraManager';

/**
 3d representation of a celestial body: a textured sphere (and rings), its cameras, orbit lines and path tracer.
 */
export default class Body3D {
	root = new Object3D();
	celestial: CelestialBody;
	scene: JSOrreryScene;
	declare planet: Object3D;
	maxDeltaForSiderealDay?: number;
	maxScale?: number;
	scale?: number;
	maxPrecision?: boolean;
	tracer?: Tracer;
	orbitLines?: BodyOrbitLines;
	cameras: Record<string, BodyCamera> = {};

	constructor(celestialBody: CelestialBody, scene: JSOrreryScene) {
		this.celestial = celestialBody;
		this.scene = scene;
		//max delta T to show rotation. If deltaT is larger than that, planet would spin too fast, so don't show sidereal day
		this.maxDeltaForSiderealDay = this.celestial.siderealDay && this.celestial.siderealDay / 20;

		this.setDisplayObject();

		//make this display object available from the celestial body
		this.celestial.body3d = this;
	}

	getDisplayObject() {
		return this.root;
	}

	setTracer(tracer: Tracer) {
		this.tracer = tracer;
	}

	setOrbitLines(orbitLines: BodyOrbitLines) {
		this.orbitLines = orbitLines;
	}

	getOrbitLines() {
		return this.orbitLines;
	}

	getTraceRelativeToBody(): CelestialBody | undefined {
		return this.celestial.universe.getBody(this.celestial.traceRelativeTo || this.celestial.relativeTo);
	}

	setDisplayObject() {
		const map = this.celestial.map;
		const matOptions: MeshPhongMaterialParameters = {};
		let onMaterialReady: Promise<MeshPhongMaterialParameters>;
		if (map) {
			onMaterialReady = ResourceLoader.loadTexture(map).then((planetMap: Texture) => {
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
			this.planet.add(sphere);
		});

		const ringDef = this.celestial.ring;
		if (ringDef) {
			ResourceLoader.loadTexture(ringDef.map).then(ringMap => {
				const ringSize = [
					Dimensions.getScaled(ringDef.innerRadius * KM),
					Dimensions.getScaled(ringDef.outerRadius * KM),
				];

				const ringMaterial = new MeshLambertMaterial({
					map: ringMap,
					transparent: true,
					side: DoubleSide,
				});

				const ringGeometry = new RingGeometry2(ringSize[1], ringSize[0], 180, 1, 0, Math.PI * 2);

				const ring = new Mesh(ringGeometry, ringMaterial);
				ring.rotation.x = -Math.PI / 2;
				this.planet.add(ring);
			});
		}

		this.planet.rotation.copy(this.celestial.getTilt(QUARTER_CIRCLE));

		this.root.add(this.planet);
		return this.planet;
	}

	setScale(scaleVal: number) {
		if (this.maxScale && this.maxScale < scaleVal) return;
		this.scale = scaleVal;
		this.planet.scale.set(this.scale, this.scale, this.scale);
	}

	getPlanetSize() {
		return Dimensions.getScaled(this.celestial.radius * KM);
	}

	getPlanetStageSize() {
		return this.getPlanetSize() * (this.scale || 1);
	}

	addCamera(name: string, camera: BodyCamera) {
		this.root.add(camera);
		this.cameras[name] = camera;
	}

	getCamera(name: string): BodyCamera | undefined {
		return this.cameras[name];
	}

	draw() {
		const pos = this.getPosition();
		this.root.position.copy(pos);

		if (this.celestial.siderealDay) {
			const qTilt = new Quaternion().setFromEuler(this.celestial.getTilt(QUARTER_CIRCLE));
			const qRot = new Quaternion().setFromEuler(new Euler(0, (this.celestial.baseMapRotation || 0) + this.celestial.getCurrentRotation(), 0, 'XYZ'));
			const q = new Quaternion().multiplyQuaternions(qTilt, qRot);
			this.planet.setRotationFromQuaternion(q);
		}

		if (this.tracer) this.tracer.draw(pos);
		if (this.orbitLines) this.orbitLines.draw(Dimensions.getScaled(this.celestial.getRelativePosition()));
		return pos;
	}

	getScreenSizeRatio(camPos: Vector3, fov: number) {
		const sz = this.getPlanetStageSize();
		const dist = this.getPosition().sub(camPos).length();

		const height = 2 * Math.tan((fov * DEG_TO_RAD) / 2) * dist; // visible height, see http://stackoverflow.com/questions/13350875/three-js-width-of-view/13351534#13351534
		return sz / height;
	}

	/** position in the scene (scaled) */
	getPosition(pos?: Vector3) {
		const curPosition = (pos && pos.clone()) || this.celestial.getPosition();
		return Dimensions.getScaled(curPosition);
	}

	getName() {
		return this.celestial.name;
	}

	// overridden by the sun
	setAspectRatio(_ratio: number) {}
}
