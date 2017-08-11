import { Vector3, ShaderMaterial, Object3D, PlaneGeometry, Mesh, PointLight, DirectionalLight } from 'three';
import ResourceLoader from '../loaders/ResourceLoader';
import Dimensions from './Dimensions';
import { KM, DEG_TO_RAD } from '../constants';
import CameraManager from './CameraManager';
import Body3D from './Body3d';
import { radius as sunRadius } from '../scenario/scenarios/bodies/sun';


class SunCorona {
	constructor(scene) {
		this.root = new Object3D();
		this.sunSize = Dimensions.getScaled(sunRadius * KM);
		const geoSize = scene.getSize() * 0.4;
		
		const uniforms = {
			aspectRatio: { type: 'f', value: scene.getAspectRatio() },
			sunPosition: { type: 'v3', value: new Vector3() },
			sunScreenPos: { type: 'v3', value: new Vector3() },
			sunSize: { type: 'f', value: 0.0 },
			randAngle: { type: 'f', value: 0.0 },
			camAngle: { type: 'f', value: 0.0 },
		};
		
		this.uniforms = uniforms;
		
		const onShaderLoaded = ResourceLoader.loadShaders('sun');
		onShaderLoaded.then(shaders => {
			
			const mat = new ShaderMaterial({
				fragmentShader: shaders.fragment,
				vertexShader: shaders.vertex,
				uniforms,
				transparent: true,
			});
			// const material = new MeshBasicMaterial({ color: 0xaa7700 });

			const geo = new PlaneGeometry(geoSize, geoSize, 10, 10);
			this.mesh = new Mesh(geo, mat);

			this.root.add(this.mesh);
		});
	}

	draw(camPos, sunPos) {
		const camToSun = camPos.clone().sub(sunPos);

		this.mesh.quaternion.copy(CameraManager.getCamera().quaternion);

		this.mesh.position.copy(camToSun.clone().multiplyScalar(0.1));/**/
		// const scaleRatio = (camToSun.length() / this.stageSize) * 0.8;

		const sunScreenPos = sunPos.clone().project(CameraManager.getCamera());
		// sceneW = $(window).width();
		// sceneH = $(window).height();
		// this.sky.mesh.scale.set(scaleRatio, scaleRatio, scaleRatio);/**/
		this.uniforms.sunPosition.value.copy(camToSun.multiplyScalar(-1));
		
		const visibleW = Math.tan(DEG_TO_RAD * CameraManager.getCamera().fov / 2) * camToSun.length() * 2;
		const sunScaledSize = this.sunSize * this.scale;
		const sunScreenRatio = sunScaledSize / visibleW;
		// console.log(visibleW, CameraManager.getCamera().fov, camToSun.length(), sunScaledSize);
		this.uniforms.sunSize.value = sunScreenRatio;
		this.uniforms.randAngle.value = (this.uniforms.randAngle.value + 0.001);
		this.uniforms.camAngle.value = camToSun.angleTo(new Vector3(1, 1, 0));
		this.uniforms.sunScreenPos.value = sunScreenPos;
	}

}


//creates a fake sun, for scenarios where the sun is not part of the setup
export class ExternalSun {
	constructor(centralCelestialBody, universe) {
		this.root = new Object3D();
		this.universe = universe;
		this.centralCelestialBody = centralCelestialBody;
		this.corona = new SunCorona(universe.getScene());
		this.corona.scale = 3;
		this.corona.sunSize = 10;
		this.root.add(new DirectionalLight(0xFFFFFF, 1));
		this.root.add(this.corona.root);

	}

	draw(camPos) {
		const sunPos = this.centralCelestialBody.calculatePosition(this.universe.getCurrentJD());
		sunPos.setLength(this.universe.getScene().getSize() * 4).negate();
		this.root.position.copy(sunPos);
		this.corona.draw(camPos, sunPos);
		
	}
	
	getDisplayObject() {
		return this.root;
	}
}

export default class Sun extends Body3D {
	
	draw(camPos) {
		if (!camPos) return;
		const sunPos = Dimensions.getScaled(this.celestial.getPosition());
		this.corona.draw(camPos, sunPos);
	}

	setDisplayObject() {
		this.corona = new SunCorona(this.celestial.universe.getScene());
		this.root.add(new PointLight(0xFFFFFF));
		this.root.add(this.corona.root);
	}

	setScale(val) {
		this.corona.scale = val;
	}

	getDisplayObject() {
		return this.root;
	}

}
