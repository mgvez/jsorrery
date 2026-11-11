import { Vector3, ShaderMaterial, Object3D, PlaneGeometry, Mesh, PointLight, DirectionalLight, type Camera, type PerspectiveCamera } from 'three';
import * as ResourceLoader from '../loaders/ResourceLoader';
import * as Dimensions from './Dimensions';
import { KM, DEG_TO_RAD } from '../core/constants';
import Body3D from './Body3d';
import { SUN_RADIUS } from '../scenario/scenarios/bodies/sun';
import type CelestialBody from '../core/CelestialBody';
import type Simulation from '../core/Simulation';

/** The glow and rays around the sun, drawn by a shader on a plane that always faces the camera */
class SunCorona {
	root = new Object3D();
	sunSize: number;
	scale = 1;
	mesh?: Mesh;
	uniforms: {
		aspectRatio: { value: number };
		sunPosition: { value: Vector3 };
		sunScreenPos: { value: Vector3 };
		sunSize: { value: number };
		randAngle: { value: number };
		camAngle: { value: number };
	};

	constructor(aspectRatio: number, stageSize: number) {
		this.sunSize = Dimensions.getScaled(SUN_RADIUS * KM);
		const geoSize = stageSize * 0.4;
		const uniforms = {
			aspectRatio: { value: aspectRatio },
			sunPosition: { value: new Vector3() },
			sunScreenPos: { value: new Vector3() },
			sunSize: { value: 0.0 },
			randAngle: { value: 0.0 },
			camAngle: { value: 0.0 },
		};

		this.uniforms = uniforms;

		ResourceLoader.loadShaders('sun').then(shaders => {
			const mat = new ShaderMaterial({
				fragmentShader: shaders.fragment,
				vertexShader: shaders.vertex,
				uniforms,
				transparent: true,
			});

			const geo = new PlaneGeometry(geoSize, geoSize, 10, 10);
			this.mesh = new Mesh(geo, mat);

			this.root.add(this.mesh);
		});
	}

	draw(cam: PerspectiveCamera, camPos: Vector3, sunPos: Vector3) {
		if (!this.mesh) return;
		const camToSun = camPos.clone().sub(sunPos);

		this.mesh.quaternion.copy(cam.quaternion);

		this.mesh.position.copy(camToSun.clone().multiplyScalar(0.1));

		const sunScreenPos = sunPos.clone().project(cam as Camera);

		this.uniforms.sunPosition.value.copy(camToSun.multiplyScalar(-1));

		const visibleW = Math.tan(DEG_TO_RAD * cam.fov / 2) * camToSun.length() * 2;
		const sunScaledSize = this.sunSize * this.scale;
		const sunScreenRatio = sunScaledSize / visibleW;
		this.uniforms.sunSize.value = sunScreenRatio;
		this.uniforms.randAngle.value = (this.uniforms.randAngle.value + 0.001);
		this.uniforms.camAngle.value = camToSun.angleTo(new Vector3(1, 1, 0));
		this.uniforms.sunScreenPos.value = sunScreenPos;
	}

	setAspectRatio(ratio: number) {
		this.uniforms.aspectRatio.value = ratio;
	}
}

//creates a fake sun, for scenarios where the sun is not part of the setup
export class ExternalSun {
	root = new Object3D();
	universe: Simulation;
	centralCelestialBody: CelestialBody;
	corona: SunCorona;
	stageSize: number;

	constructor(centralCelestialBody: CelestialBody, universe: Simulation, aspectRatio: number, stageSize: number) {
		this.universe = universe;
		this.centralCelestialBody = centralCelestialBody;
		this.stageSize = stageSize;
		this.corona = new SunCorona(aspectRatio, stageSize);
		this.corona.scale = 3;
		this.corona.sunSize = 10;
		this.root.add(new DirectionalLight(0xFFFFFF, Math.PI));
		this.root.add(this.corona.root);
	}

	draw(cam: PerspectiveCamera, camPos: Vector3) {
		const sunPos = this.centralCelestialBody.calculatePosition(this.universe.getCurrentJD());
		sunPos.setLength(this.stageSize * 4).negate();
		this.root.position.copy(sunPos);
		this.corona.draw(cam, camPos, sunPos);
	}

	getDisplayObject() {
		return this.root;
	}

	setAspectRatio(ratio: number) {
		this.corona.setAspectRatio(ratio);
	}
}

export default class Sun extends Body3D {
	declare corona: SunCorona;

	override draw(cam?: PerspectiveCamera, camPos?: Vector3) {
		if (!cam || !camPos) return this.getPosition();
		const sunPos = Dimensions.getScaled(this.celestial.getPosition());
		this.corona.draw(cam, camPos, sunPos);
		return sunPos;
	}

	override setDisplayObject() {
		const scene = this.scene;
		this.corona = new SunCorona(scene.getAspectRatio(), scene.getSize());
		//no decay (legacy lighting behaviour), intensity scaled by PI to match legacy mode
		this.root.add(new PointLight(0xFFFFFF, Math.PI, 0, 0));
		this.root.add(this.corona.root);
		//sun has no visible planet object (the corona shader draws it), but other code expects one
		this.planet = new Object3D();
		return this.planet;
	}

	override setScale(val: number) {
		this.corona.scale = val;
	}

	override setAspectRatio(ratio: number) {
		this.corona.setAspectRatio(ratio);
	}
}
