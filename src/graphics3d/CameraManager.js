
import $ from 'jquery';
import { Vector3, PerspectiveCamera } from 'three';
import { OrbitControls } from '../utils/ThreeExamples';
import ExportValues from '../gui/ExportValues';
import { LOOKFROM_ID, LOOKAT_ID } from '../gui/Gui';
import { DEG_TO_RAD } from '../core/constants';
import GeoPos from './GeoPos';

const DEFAULT_FOV = 45;
const MAX_FOV = 90;
const ORBITAL_CAMERA_TYPE = 'orbital';
const POV_CAMERA_TYPE = 'pov';

const toggling_at_options = ['night', 'front', 'back'];
const lookAt = new Vector3();

function getDistanceFromFov(dimToSee, fov) {
	return dimToSee * Math.atan(fov * 2 * DEG_TO_RAD);
}


export default class CameraManager {
	constructor(sceneParam, aspect, fov, stageSize, container, universeParam, orbitLinesManager, tracerManager, gui) {
		this.gui = gui;
		this.scene = sceneParam;
		this.universe = universeParam;
		this.domEl = $(container);
		this.allCameras = [];
		this.bodies3d = {};
		this.viewSettings = {};
		this.cameraParams = {
			fov: fov || DEFAULT_FOV,
			aspect,
			near: 0.001,
			far: 2000000, ///stageSize * 10,
		};
		this.orbitLinesManager = orbitLinesManager;
		this.tracerManager = tracerManager;

		this.globalCamera = this.getNewCamera(true);
		this.globalCamera.position.set(0, -1, getDistanceFromFov(stageSize, this.globalCamera.fov));

		this.scene.getRoot().add(this.globalCamera);

		this.trackOptionSelectors = {
			from: gui.addDropdown(LOOKFROM_ID, this.toggleCamera),
			at: gui.addDropdown(LOOKAT_ID, this.toggleCamera),
		};
		
		this.trackOptionSelectors.from.addOption('Free camera', 'orbital');
		this.trackOptionSelectors.at.addOption('System', 'universe');

		if (this.universe.getBody().name === 'sun') {
			this.trackOptionSelectors.at.addOption('Night (away from the sun)', 'night');
		}
		
		this.trackOptionSelectors.at.addOption('Direction of velocity', 'front');
		this.trackOptionSelectors.at.addOption('Inverse direction of velocity', 'back');

	}

	putDefaults(settings) {
		// console.log(settings);
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

	addBody(body3d) {				
		this.trackOptionSelectors.from.addOption(body3d.celestial.title, body3d.celestial.name);
		this.trackOptionSelectors.at.addOption(body3d.celestial.title, body3d.celestial.name);

		function getCamPos(dbg) {
			if (dbg) {
				// console.log(this.position.clone());
				// console.log(body3d.getDisplayObject().position.clone());
			}
			return body3d.getDisplayObject().localToWorld(this.position.clone());
		}

		const pov = this.getNewCamera();
		pov.getAbsolutePos = getCamPos;
		body3d.addCamera(POV_CAMERA_TYPE, pov);

		const orbital = this.getNewCamera(true);
		orbital.getAbsolutePos = getCamPos;
		orbital.position.set(0, -1, body3d.getPlanetStageSize() * 200);

		body3d.addCamera(ORBITAL_CAMERA_TYPE, orbital);

		//on the earth, position the camera at specific lon/lat
		if (body3d.celestial.hasGeoposCam) {
			pov.geoPos = new GeoPos(body3d, pov, this.gui);

			// pov.geoPos.activate();	
			// this.setPrecision(true);

		}

		this.bodies3d[body3d.celestial.name] = body3d;
	}

	getCamera() {
		if (typeof this.viewSettings.lookFrom === 'undefined') this.toggleCamera();
		return this.currentCamera;
	}

	getCameraPosition() {
		return (this.getCamera().getAbsolutePos && this.getCamera().getAbsolutePos(true)) || this.getCamera().position;
	}

	updateCameraMatrix() {
		if (this.currentCamera && this.currentCamera.parent) this.currentCamera.parent.updateMatrixWorld();
	}

	setPrecision(val) {
		Object.keys(this.bodies3d).forEach(name => {
			this.bodies3d[name].celestial.maxPrecision = val;
		});
	}

	toggleCamera = () => {
		this.viewSettings.lookFrom = this.trackOptionSelectors.from.getValue();
		this.viewSettings.lookAt = this.trackOptionSelectors.at.getValue();
		this.disableControls();

		//deactivate geopos GUI
		if (this.currentCamera && this.currentCamera.geoPos) this.currentCamera.geoPos.deactivate();
		
		//reset all bodies to use fastest position computation
		this.setPrecision(false);

		const lookFromBody = this.bodies3d[this.viewSettings.lookFrom];
		const lookAtBody = this.bodies3d[this.viewSettings.lookAt];
		this.tracerManager.setTraceFrom();

		if (lookFromBody) {
			this.currentCamera = lookFromBody.getCamera(POV_CAMERA_TYPE);
			this.domEl.on('mousewheel', this.onMouseWheel);

			//when looking from a body, we need max precision as a minor change in position changes the expected output (e.g. a bodie's position against the stars)
			this.setPrecision(true);
			
			//if we look from a body to another, trace the lookat body's path relative to the pov UNLESS the look target is orbiting to the pov
			if (lookAtBody && !lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
				this.tracerManager.setTraceFrom(lookFromBody, lookAtBody);
			}

			if (this.currentCamera.geoPos) this.currentCamera.geoPos.activate();

		} else {
			this.domEl.off('mousewheel');

			//if we want to look from an orbital camera, check if it is to look at a particular body or to the whole system
			if (this.viewSettings.lookFrom === ORBITAL_CAMERA_TYPE) {
				this.currentCamera = (lookAtBody && lookAtBody.getCamera(ORBITAL_CAMERA_TYPE)) || this.globalCamera;
				if (this.currentCamera.jsorrery && this.currentCamera.jsorrery.controls) this.currentCamera.jsorrery.controls.enabled = true;
			}
		}
		
		this.universe.repositionBodies();

		this.trackOptionSelectors.at.toggleOptions([...toggling_at_options, this.viewSettings.lookAt], !!lookFromBody);

		ExportValues.setCamera(this.currentCamera);

		//we show/hide orbits and ecliptics depending on what bodies are of interest
		this.orbitLinesManager.onCameraChange(lookFromBody, lookAtBody);

		this.updateCamera();
		// scene.draw();
		this.universe.requestDraw();
	}

	updateCamera() {

		if (typeof this.viewSettings.lookFrom === 'undefined') this.toggleCamera();

		const lookFromBody = this.bodies3d[this.viewSettings.lookFrom];
		const lookAtBody = this.bodies3d[this.viewSettings.lookAt];
		const controls = this.currentCamera.jsorrery && this.currentCamera.jsorrery.controls;

		if (this.currentCamera.geoPos) this.currentCamera.geoPos.update();
		
		if (controls) {
			controls.update();
		} else if (this.viewSettings.lookFrom) {

			if (lookAtBody) {
				lookAt.copy(lookAtBody.getPosition()).sub(lookFromBody.getPosition());	
			} else if (this.viewSettings.lookAt === 'night') {
				lookAt.copy(lookFromBody.getPosition());
				lookAt.multiplyScalar(2);
			} else if ('front,back'.indexOf(this.viewSettings.lookAt) !== -1) {
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

	onMouseWheel = (event, delta) => {
		const deltaDir = delta / Math.abs(delta);
		this.currentCamera.fov += this.currentCamera.fov * 0.1 * -deltaDir;
		if (this.currentCamera.fov > MAX_FOV) this.currentCamera.fov = MAX_FOV;
		this.currentCamera.updateProjectionMatrix();
		this.scene.draw();
	}

	onControlsUpdate = () => {
		if (!this.universe.isPlaying()) this.scene.draw();
	}

	
	getNewCamera(isOrbital) {
		const cam = new PerspectiveCamera(this.cameraParams.fov, this.cameraParams.aspect, this.cameraParams.near, this.cameraParams.far);
		cam.up = new Vector3(0, 0, 1);

		if (isOrbital) {
			const controls = new OrbitControls(cam, this.domEl.get(0));
			//set the controls as a property of the camera, but namespaced
			cam.jsorrery = cam.jsorrery || {};
			cam.jsorrery.controls = controls;
			controls.addEventListener('change', this.onControlsUpdate);
			controls.target.set(0, 0, 0);
			controls.enabled = false;
		}

		this.allCameras.push(cam);
		return cam;
	}

	disableControls() {
		this.allCameras.forEach(cam => {
			if (cam.jsorrery && cam.jsorrery.controls) cam.jsorrery.controls.enabled = false;
		});
	}

	kill() {
		if (this.domEl) this.domEl.off('mousewheel');

		this.allCameras.forEach(cam => {
			if (cam.jsorrery && cam.jsorrery.controls) cam.jsorrery.controls.removeEventListener('change', this.onControlsUpdate);
		});
	}
};
