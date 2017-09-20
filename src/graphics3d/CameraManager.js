
import { Vector3, PerspectiveCamera } from 'three';
import { OrbitControls } from '../utils/ThreeExamples';
import TracerManager from './lines/TracerManager';
import OrbitLinesManager from './lines/OrbitLinesManager';
import ExportValues from '../gui/ExportValues';
import Gui, { LOOKFROM_ID, LOOKAT_ID } from '../gui/Gui';
import { DEG_TO_RAD } from '../constants';
import GeoPos from './GeoPos';

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
let universe;
let domEl;


function setPrecision(val) {
	Object.keys(bodies3d).forEach(name => {
		bodies3d[name].celestial.maxPrecision = val;
	});
}

function toggleCamera() {
	viewSettings.lookFrom = trackOptionSelectors.from.getValue();
	viewSettings.lookAt = trackOptionSelectors.at.getValue();
	disableControls();

	//deactivate geopos GUI
	if (currentCamera && currentCamera.geoPos) currentCamera.geoPos.deactivate();
	
	//reset all bodies to use fastest position computation
	setPrecision(false);

	const lookFromBody = bodies3d[viewSettings.lookFrom];
	const lookAtBody = bodies3d[viewSettings.lookAt];
	TracerManager.setTraceFrom();

	if (lookFromBody) {
		currentCamera = lookFromBody.getCamera(POV_CAMERA_TYPE);
		domEl.on('mousewheel', onMouseWheel);

		//when looking from a body, we need max precision as a minor change in position changes the expected output (e.g. a bodie's position against the stars)
		setPrecision(true);
		
		//if we look from a body to another, trace the lookat body's path relative to the pov UNLESS the look target is orbiting to the pov
		if (lookAtBody && !lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
			TracerManager.setTraceFrom(lookFromBody, lookAtBody);
		}

		if (currentCamera.geoPos) currentCamera.geoPos.activate();

	} else {
		domEl.off('mousewheel');

		//if we want to look from an orbital camera, check if it is to look at a particular body or to the whole system
		if (viewSettings.lookFrom === ORBITAL_CAMERA_TYPE) {
			currentCamera = (lookAtBody && lookAtBody.getCamera(ORBITAL_CAMERA_TYPE)) || globalCamera;
			if (currentCamera.jsorrery && currentCamera.jsorrery.controls) currentCamera.jsorrery.controls.enabled = true;
		}
	}
	universe.repositionBodies();

	trackOptionSelectors.at.toggleOptions([...toggling_at_options, viewSettings.lookAt], !!lookFromBody);

	ExportValues.setCamera(currentCamera);

	//we show/hide orbits and ecliptics depending on what bodies are of interest
	OrbitLinesManager.onCameraChange(lookFromBody, lookAtBody);

	updateCamera();
	// scene.draw();
	universe.requestDraw();
}

function updateCamera() {

	if (typeof viewSettings.lookFrom === 'undefined') toggleCamera();

	const lookFromBody = bodies3d[viewSettings.lookFrom];
	const lookAtBody = bodies3d[viewSettings.lookAt];
	const controls = currentCamera.jsorrery && currentCamera.jsorrery.controls;

	if (currentCamera.geoPos) currentCamera.geoPos.update();
	
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

function onMouseWheel(event, delta) {
	const deltaDir = delta / Math.abs(delta);
	currentCamera.fov += currentCamera.fov * 0.1 * -deltaDir;
	if (currentCamera.fov > MAX_FOV) currentCamera.fov = MAX_FOV;
	currentCamera.updateProjectionMatrix();
	scene.draw();
}

function onControlsUpdate() {
	if (!universe.isPlaying()) scene.draw();
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
	init(sceneParam, aspect, fov, stageSize, container, universeParam) {
		scene = sceneParam;
		universe = universeParam;
		domEl = container;
		allCameras = [];
		bodies3d = {};
		viewSettings = {};
		cameraParams = {
			fov: fov || DEFAULT_FOV,
			aspect,
			near: 0.001,
			far: 2000000, ///stageSize * 10,
		};

		globalCamera = getNewCamera(true);
		globalCamera.position.set(0, -1, getDistanceFromFov(stageSize, globalCamera.fov));

		scene.root.add(globalCamera);

		trackOptionSelectors = {
			from: Gui.addDropdown(LOOKFROM_ID, toggleCamera),
			at: Gui.addDropdown(LOOKAT_ID, toggleCamera),
		};
		
		trackOptionSelectors.from.addOption('Free camera', 'orbital');
		trackOptionSelectors.at.addOption('System', 'universe');

		if (universe.getBody().name === 'sun') {
			trackOptionSelectors.at.addOption('Night (away from the sun)', 'night');
		}
		
		trackOptionSelectors.at.addOption('Direction of velocity', 'front');
		trackOptionSelectors.at.addOption('Inverse direction of velocity', 'back');

	},

	putDefaults(settings) {
		// console.log(settings);
		if (settings) {
			//if geoposition of cam, the gui will force initial settings
			if (!currentCamera.geoPos) {
				currentCamera.position.x = Number(settings.x) || 0;
				currentCamera.position.y = Number(settings.y) || 0;
				currentCamera.position.z = Number(settings.z) || 0;
			}
			currentCamera.fov = Number(settings.fov) || DEFAULT_FOV;
			if (settings.far) currentCamera.far = settings.far;
			currentCamera.updateProjectionMatrix();

			if (settings.disableControls) disableControls();
		}
	},

	addBody(body3d) {				
		trackOptionSelectors.from.addOption(body3d.celestial.title, body3d.celestial.name);
		trackOptionSelectors.at.addOption(body3d.celestial.title, body3d.celestial.name);

		function getCamPos(dbg) {
			if (dbg) {
				// console.log(this.position.clone());
				// console.log(body3d.getDisplayObject().position.clone());
			}
			return body3d.getDisplayObject().localToWorld(this.position.clone());
		}

		const pov = getNewCamera();
		pov.getAbsolutePos = getCamPos;
		body3d.addCamera(POV_CAMERA_TYPE, pov);

		const orbital = getNewCamera(true);
		orbital.getAbsolutePos = getCamPos;
		orbital.position.set(0, -1, body3d.getPlanetStageSize() * 200);

		body3d.addCamera(ORBITAL_CAMERA_TYPE, orbital);

		//on the earth, position the camera at specific lon/lat
		if (body3d.celestial.hasGeoposCam) {
			pov.geoPos = new GeoPos(body3d, pov);

			// pov.geoPos.activate();	
			// setPrecision(true);

		}

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

	getCameraPosition() {
		return (this.getCamera().getAbsolutePos && this.getCamera().getAbsolutePos(true)) || this.getCamera().position;
	},

	updateCameraMatrix() {
		if (currentCamera && currentCamera.parent) currentCamera.parent.updateMatrixWorld();
	},

	kill() {
		if (domEl) domEl.off('mousewheel');

		allCameras.forEach(cam => {
			if (cam.jsorrery && cam.jsorrery.controls) cam.jsorrery.controls.removeEventListener('change', onControlsUpdate);
		});
	},
};
