import { Vector3, PerspectiveCamera, Matrix4 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DEG_TO_RAD } from '../core/constants';
import GeoPos from './GeoPos';
import type Body3D from './Body3d';
import type JSOrreryScene from './Scene';
import type OrbitLinesManager from './lines/OrbitLinesManager';
import type TracerManager from './lines/TracerManager';
import type Universe from '../core/Universe';
import type { CameraSettings } from '../scenario/types';
import type { SelectOption } from '../state/types';
import type { GeoLoc } from '../utils/GeoCoord';

const DEFAULT_FOV = 45;
const MAX_FOV = 90;
export const ORBITAL_CAMERA_TYPE = 'orbital';
const POV_CAMERA_TYPE = 'pov';
export const LOOK_AT_SYSTEM = 'universe';

const lookAt = new Vector3();
const lookAtMatrix = new Matrix4();

function getDistanceFromFov(dimToSee: number, fov: number) {
	return dimToSee * Math.atan(fov * 2 * DEG_TO_RAD);
}

/**
 Cameras are attached to the bodies they follow, and their targets (from OrbitControls or from the "look at" setting)
 are expressed in the parent body's space. three.js' Object3D.lookAt() interpreted targets in parent space up to r8x, but
 now expects world coordinates; this camera keeps the original behaviour.
 */
export class BodyCamera extends PerspectiveCamera {
	controls?: OrbitControls;
	geoPos?: GeoPos;
	/** position of the camera in the world, when it is attached to a body */
	getAbsolutePos?: () => Vector3;

	override lookAt(x: Vector3 | number, y?: number, z?: number) {
		const target = x instanceof Vector3 ? x : new Vector3(x, y, z);
		lookAtMatrix.lookAt(this.position, target, this.up);
		this.quaternion.setFromRotationMatrix(lookAtMatrix);
	}
}

interface CameraManagerParams {
	scene: JSOrreryScene;
	aspect: number;
	fov?: number;
	stageSize: number;
	container: HTMLElement;
	universe: Universe;
	orbitLinesManager: OrbitLinesManager;
	tracerManager: TracerManager;
	/** initial position of geolocated cameras (e.g. "46.8139, -71.2080") */
	geoloc?: string;
}

export default class CameraManager {
	scene: JSOrreryScene;
	universe: Universe;
	domEl: HTMLElement;
	allCameras: BodyCamera[] = [];
	bodies3d: Record<string, Body3D> = {};
	viewSettings: { lookFrom?: string; lookAt?: string } = {};
	cameraParams: { fov: number; aspect: number; near: number; far: number };
	orbitLinesManager: OrbitLinesManager;
	tracerManager: TracerManager;
	globalCamera: BodyCamera;
	declare currentCamera: BodyCamera;
	geoloc?: string;
	lookFromOptions: SelectOption[];
	lookAtOptions: SelectOption[];

	constructor(params: CameraManagerParams) {
		this.scene = params.scene;
		this.universe = params.universe;
		this.domEl = params.container;
		this.geoloc = params.geoloc;
		this.cameraParams = {
			fov: params.fov || DEFAULT_FOV,
			aspect: params.aspect,
			near: 0.001,
			far: 2000000,
		};
		this.orbitLinesManager = params.orbitLinesManager;
		this.tracerManager = params.tracerManager;

		this.globalCamera = this.getNewCamera(true);
		this.globalCamera.position.set(0, -1, getDistanceFromFov(params.stageSize, this.globalCamera.fov));

		this.scene.getRoot().add(this.globalCamera);

		this.lookFromOptions = [{ value: ORBITAL_CAMERA_TYPE, label: 'Free camera' }];
		this.lookAtOptions = [{ value: LOOK_AT_SYSTEM, label: 'System' }];

		if (this.universe.getBody().name === 'sun') {
			this.lookAtOptions.push({ value: 'night', label: 'Night (away from the sun)' });
		}

		this.lookAtOptions.push({ value: 'front', label: 'Direction of velocity' });
		this.lookAtOptions.push({ value: 'back', label: 'Inverse direction of velocity' });
	}

	putDefaults(settings?: CameraSettings) {
		this.getCamera();
		if (settings) {
			//if geoposition of cam, the gui will force initial settings
			if (!this.currentCamera.geoPos) {
				this.currentCamera.position.x = Number(settings.x) || 0;
				this.currentCamera.position.y = Number(settings.y) || 0;
				this.currentCamera.position.z = Number(settings.z) || 0;
			}
			this.currentCamera.fov = Number(settings.fov) || DEFAULT_FOV;
			if (settings.far) this.currentCamera.far = settings.far;
			this.currentCamera.updateProjectionMatrix();

			if (settings.disableControls) this.disableControls();
		}
	}

	addBody(body3d: Body3D) {
		const option = { value: body3d.celestial.name, label: body3d.celestial.title || body3d.celestial.name };
		this.lookFromOptions.push(option);
		this.lookAtOptions.push(option);

		const getCamPos = function getCamPos(this: BodyCamera) {
			return body3d.getDisplayObject().localToWorld(this.position.clone());
		};

		const pov = this.getNewCamera();
		pov.getAbsolutePos = getCamPos;
		body3d.addCamera(POV_CAMERA_TYPE, pov);

		const orbital = this.getNewCamera(true);
		orbital.getAbsolutePos = getCamPos;
		orbital.position.set(0, -1, body3d.getPlanetStageSize() * 200);

		body3d.addCamera(ORBITAL_CAMERA_TYPE, orbital);

		//on the earth, position the camera at specific lon/lat
		if (body3d.celestial.hasGeoposCam) {
			pov.geoPos = new GeoPos(body3d, pov, this.universe, this.geoloc);
		}

		this.bodies3d[body3d.celestial.name] = body3d;
	}

	getCamera() {
		if (typeof this.viewSettings.lookFrom === 'undefined') this.setView();
		return this.currentCamera;
	}

	getCameraPosition() {
		return (this.getCamera().getAbsolutePos && this.getCamera().getAbsolutePos!()) || this.getCamera().position;
	}

	updateCameraMatrix() {
		if (this.currentCamera && this.currentCamera.parent) this.currentCamera.parent.updateMatrixWorld();
	}

	setPrecision(val: boolean) {
		Object.keys(this.bodies3d).forEach(name => {
			this.bodies3d[name].celestial.maxPrecision = val;
		});
	}

	/**
	 Sets the view. Values that are not available are replaced by the first available option (the free camera / the whole system).
	 Returns the view that was actually set.
	 */
	setView(lookFrom?: string, lookAtValue?: string) {
		const isAvailable = (options: SelectOption[], value?: string) => options.some(option => option.value === value);
		this.viewSettings.lookFrom = isAvailable(this.lookFromOptions, lookFrom) ? lookFrom : this.lookFromOptions[0].value;
		this.viewSettings.lookAt = isAvailable(this.lookAtOptions, lookAtValue) ? lookAtValue : this.lookAtOptions[0].value;
		this.toggleCamera();
		return { lookFrom: this.viewSettings.lookFrom!, lookAt: this.viewSettings.lookAt! };
	}

	toggleCamera() {
		this.disableControls();

		//deactivate geopos GUI
		if (this.currentCamera && this.currentCamera.geoPos) this.currentCamera.geoPos.deactivate();

		//reset all bodies to use fastest position computation
		this.setPrecision(false);

		const lookFromBody = this.bodies3d[this.viewSettings.lookFrom!];
		const lookAtBody = this.bodies3d[this.viewSettings.lookAt!];
		this.tracerManager.setTraceFrom();

		if (lookFromBody) {
			this.currentCamera = lookFromBody.getCamera(POV_CAMERA_TYPE)!;
			this.domEl.addEventListener('wheel', this.onMouseWheel);

			//when looking from a body, we need max precision as a minor change in position changes the expected output (e.g. a bodie's position against the stars)
			this.setPrecision(true);

			//if we look from a body to another, trace the lookat body's path relative to the pov UNLESS the look target is orbiting to the pov
			if (lookAtBody && !lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
				this.tracerManager.setTraceFrom(lookFromBody, lookAtBody);
			}

			if (this.currentCamera.geoPos) this.currentCamera.geoPos.activate();
		} else {
			this.domEl.removeEventListener('wheel', this.onMouseWheel);

			//if we want to look from an orbital camera, check if it is to look at a particular body or to the whole system
			if (this.viewSettings.lookFrom === ORBITAL_CAMERA_TYPE) {
				this.currentCamera = (lookAtBody && lookAtBody.getCamera(ORBITAL_CAMERA_TYPE)) || this.globalCamera;
				if (this.currentCamera.controls) this.currentCamera.controls.enabled = true;
			}
		}

		this.universe.repositionBodies(false);

		//we show/hide orbits and ecliptics depending on what bodies are of interest
		this.orbitLinesManager.onCameraChange(lookFromBody, lookAtBody);

		this.updateCamera();
		this.universe.requestDraw();
	}

	updateCamera() {
		if (typeof this.viewSettings.lookFrom === 'undefined') this.setView();

		const lookFromBody = this.bodies3d[this.viewSettings.lookFrom!];
		const lookAtBody = this.bodies3d[this.viewSettings.lookAt!];
		const controls = this.currentCamera.controls;

		if (this.currentCamera.geoPos) this.currentCamera.geoPos.update();

		if (controls) {
			controls.update();
		} else if (this.viewSettings.lookFrom) {
			if (lookAtBody) {
				lookAt.copy(lookAtBody.getPosition()).sub(lookFromBody.getPosition());
			} else if (this.viewSettings.lookAt === 'night') {
				lookAt.copy(lookFromBody.getPosition());
				lookAt.multiplyScalar(2);
			} else if (this.viewSettings.lookAt === 'front' || this.viewSettings.lookAt === 'back') {
				const vel = lookFromBody.celestial.movement;
				lookAt.copy(vel).normalize();
				if (this.viewSettings.lookAt === 'back') lookAt.negate();
			} else {
				lookAt.set(0, 0, 0).sub(lookFromBody.getPosition());
			}

			this.currentCamera.lookAt(lookAt);
		}
		return this.currentCamera;
	}

	setGeoloc(loc: GeoLoc) {
		if (this.currentCamera && this.currentCamera.geoPos) this.currentCamera.geoPos.setLoc(loc);
	}

	setAspect(aspect: number) {
		this.cameraParams.aspect = aspect;
		this.allCameras.forEach(cam => {
			cam.aspect = aspect;
			cam.updateProjectionMatrix();
		});
	}

	onMouseWheel = (event: WheelEvent) => {
		if (!event.deltaY) return;
		//zoom in when scrolling up
		const deltaDir = -Math.sign(event.deltaY);
		this.currentCamera.fov += this.currentCamera.fov * 0.1 * -deltaDir;
		if (this.currentCamera.fov > MAX_FOV) this.currentCamera.fov = MAX_FOV;
		this.currentCamera.updateProjectionMatrix();
		this.scene.draw();
	};

	onControlsUpdate = () => {
		if (!this.universe.playing) this.scene.draw();
	};

	getNewCamera(isOrbital?: boolean) {
		const cam = new BodyCamera(this.cameraParams.fov, this.cameraParams.aspect, this.cameraParams.near, this.cameraParams.far);
		cam.up = new Vector3(0, 0, 1);

		if (isOrbital) {
			const controls = new OrbitControls(cam, this.domEl);
			cam.controls = controls;
			controls.addEventListener('change', this.onControlsUpdate);
			controls.target.set(0, 0, 0);
			controls.enabled = false;
		}

		this.allCameras.push(cam);
		return cam;
	}

	disableControls() {
		this.allCameras.forEach(cam => {
			if (cam.controls) cam.controls.enabled = false;
		});
	}

	kill() {
		this.domEl.removeEventListener('wheel', this.onMouseWheel);

		this.allCameras.forEach(cam => {
			if (cam.controls) {
				cam.controls.removeEventListener('change', this.onControlsUpdate);
				cam.controls.dispose();
			}
		});
	}
}
