
import { Vector3, PerspectiveCamera } from 'three';
import { OrbitControls } from '../utils/ThreeExamples';
import { getUniverse } from '../JSOrrery';
import Dimensions from './Dimensions';
import TracerManager from './TracerManager';
import OrbitLinesManager from './OrbitLinesManager';
import ExportValues from '../gui/ExportValues';
import Gui, { LOOKFROM_ID, LOOKAT_ID } from '../gui/Gui';
import { DEG_TO_RAD } from '../constants';

const DEFAULT_FOV = 45;
const MAX_FOV = 90;
const ORBITAL_CAMERA_TYPE = 'orbital';
const POV_CAMERA_TYPE = 'pov';

const toggling_at_options = ['night', 'front', 'back'];
const lookAt = new Vector3();

let bodies3d;
let trackOptionSelectors;
let viewSettings;
let globalCamera;
let currentCamera;
let allCameras;
let cameraParams;
let scene;
let domEl;


function toggleCamera() {
	viewSettings.lookFrom = trackOptionSelectors.from.val();
	viewSettings.lookAt = trackOptionSelectors.at.val();
	disableControls();


	const lookFromBody = bodies3d[viewSettings.lookFrom];
	const lookAtBody = bodies3d[viewSettings.lookAt];

	TracerManager.setTraceFrom();

	if (lookFromBody) {
		currentCamera = lookFromBody.getCamera(POV_CAMERA_TYPE);
		domEl.on('mousewheel', onMouseWheel);

		//if we look from a body to another, trace the lookat body's path relative to the pov UNLESS the look target is orbiting to the pov
		if (lookAtBody && !lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
			TracerManager.setTraceFrom(lookFromBody, lookAtBody);
		}

	} else {
		domEl.off('mousewheel');

		//if we want to look from an orbital camera, check if it is to look at a particular body or to the whole system
		if (viewSettings.lookFrom === ORBITAL_CAMERA_TYPE) {
			currentCamera = (lookAtBody && lookAtBody.getCamera(ORBITAL_CAMERA_TYPE)) || globalCamera;
			if (currentCamera.jsorrery && currentCamera.jsorrery.controls) currentCamera.jsorrery.controls.enabled = true;
		}
	}

	Gui.toggleOptions(LOOKAT_ID, toggling_at_options, !!lookFromBody);

	ExportValues.setCamera(currentCamera);

	//we show/hide orbits and ecliptics depending on what bodies are of interest
	OrbitLinesManager.onCameraChange(lookFromBody, lookAtBody);

	updateCamera();
	scene.draw();
}

function getScaledVector(v) {
	return Dimensions.getScaled(v.clone());
}

function updateCamera() {

	if (typeof viewSettings.lookFrom === 'undefined') toggleCamera();

	const lookFromBody = bodies3d[viewSettings.lookFrom];
	const lookAtBody = bodies3d[viewSettings.lookAt];
	const controls = currentCamera.jsorrery && currentCamera.jsorrery.controls;
	if (controls) {
		controls.update();
	} else if (viewSettings.lookFrom) {

		if (lookAtBody) {
			lookAt.copy(lookAtBody.getPosition()).sub(lookFromBody.getPosition());	
		} else if (viewSettings.lookAt === 'night') {
			lookAt.copy(lookFromBody.getPosition());
			lookAt.multiplyScalar(2);
		} else if ('front,back'.indexOf(viewSettings.lookAt) !== -1) {
			const vel = lookFromBody.celestial.movement;
			lookAt.copy(vel).normalize();
			if (viewSettings.lookAt === 'back') lookAt.negate();
		} else {
			lookAt.set(0, 0, 0).sub(lookFromBody.getPosition());
		}
		
		currentCamera.lookAt(lookAt);
	}
}

function onMouseWheel(event, delta, deltaX, deltaY) {
	const deltaDir = delta / Math.abs(delta);
	currentCamera.fov += currentCamera.fov * 0.1 * -deltaDir;
	if (currentCamera.fov > MAX_FOV) currentCamera.fov = MAX_FOV;
	currentCamera.updateProjectionMatrix();
	scene.draw();
}

function onControlsUpdate() {
	if (!getUniverse().isPlaying()) scene.draw();
}

function getDistanceFromFov(dimToSee, fov) {
	return dimToSee * Math.atan(fov * 2 * DEG_TO_RAD);
}

function getNewCamera(isOrbital) {
	const cam = new PerspectiveCamera(cameraParams.fov, cameraParams.aspect, cameraParams.near, cameraParams.far);
	cam.up = new Vector3(0, 0, 1);

	if (isOrbital) {
		const controls = new OrbitControls(cam, domEl.get(0));
		//set the controls as a property of the camera, but namespaced
		cam.jsorrery = cam.jsorrery || {};
		cam.jsorrery.controls = controls;
		controls.addEventListener('change', onControlsUpdate);
		controls.target.set(0, 0, 0);
		controls.enabled = false;
	}

	allCameras.push(cam);
	return cam;
}

function disableControls() {
	allCameras.forEach(cam => {
		if (cam.jsorrery && cam.jsorrery.controls) cam.jsorrery.controls.enabled = false;
	});
}

export default {
	init(sceneParam, aspect, fov, stageSize, container) {
		scene = sceneParam;
		domEl = container;
		allCameras = [];
		bodies3d = {};
		viewSettings = {};
		cameraParams = {
			fov: fov || DEFAULT_FOV,
			aspect,
			near: 0.001,
			far: stageSize * 5,
		};

		globalCamera = getNewCamera(true);
		globalCamera.position.set(0, -1, getDistanceFromFov(stageSize, globalCamera.fov));

		scene.root.add(globalCamera);

		trackOptionSelectors = {
			from: Gui.addDropdown(LOOKFROM_ID, toggleCamera),
			at: Gui.addDropdown(LOOKAT_ID, toggleCamera),
		};
		
		Gui.addOption(LOOKFROM_ID, 'Free camera', 'orbital');
		Gui.addOption(LOOKAT_ID, 'System', 'universe');

		if (getUniverse().getBody().name === 'sun') {
			Gui.addOption(LOOKAT_ID, 'Night (away from the sun)', 'night');
		}
		
		Gui.addOption(LOOKAT_ID, 'Direction of velocity', 'front');
		Gui.addOption(LOOKAT_ID, 'Inverse direction of velocity', 'back');

	},

	putDefaults(settings) {
		//console.log(settings);
		if (settings) {
			currentCamera.position.x = Number(settings.x) || 0;
			currentCamera.position.y = Number(settings.y) || 0;
			currentCamera.position.z = Number(settings.z) || 0;
			currentCamera.fov = Number(settings.fov) || DEFAULT_FOV;
			currentCamera.updateProjectionMatrix();
		}
	},

	addBody(body3d) {				
		Gui.addOption(LOOKFROM_ID, body3d.celestial.title, body3d.celestial.name);
		Gui.addOption(LOOKAT_ID, body3d.celestial.title, body3d.celestial.name);

		function getCamPos() {
			return body3d.root.localToWorld(this.position.clone());
		}

		const pov = getNewCamera();
		pov.getAbsolutePos = getCamPos;
		body3d.addCamera(POV_CAMERA_TYPE, pov);

		const orbital = getNewCamera(true);
		orbital.getAbsolutePos = getCamPos;
		orbital.position.set(0, -1, body3d.getPlanetStageSize() * 200);

		body3d.addCamera(ORBITAL_CAMERA_TYPE, orbital);

		bodies3d[body3d.celestial.name] = body3d;
	},

	updateCamera() {
		updateCamera();
		return currentCamera;
	},

	getCamera() {
		if (typeof viewSettings.lookFrom === 'undefined') toggleCamera();
		return currentCamera;
	},

	updateCameraMatrix() {
		if (currentCamera && currentCamera.parent) currentCamera.parent.updateMatrixWorld();
	},

	kill() {
		Gui.remove(LOOKAT_ID);
		Gui.remove(LOOKFROM_ID);
		if (domEl) domEl.off('mousewheel');

		allCameras.forEach(cam => {
			if (cam.jsorrery && cam.jsorrery.controls) cam.jsorrery.controls.removeEventListener('change', onControlsUpdate);
		});
	},
};
