

define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/OrbitLinesManager',
		'jsorrery/graphics3d/TracerManager',
		'jsorrery/graphics3d/Dimensions',
		'jsorrery/gui/Gui',
		'jsorrery/gui/ExportValues',
		'three/controls/OrbitControls',
		'three'
	], 
	function(ns, $, OrbitLinesManager, TracerManager, Dimensions, Gui, ExportValues) {
		'use strict';

		var DEFAULT_FOV = 45;
		var MAX_FOV = 90;
		var ORBITAL_CAMERA_TYPE = 'orbital';
		var POV_CAMERA_TYPE = 'pov';

		var toggling_at_options = ['night', 'front', 'back'];

		var bodies3d;
		var trackOptionSelectors;
		var viewSettings;
		var globalCamera;
		var currentCamera;
		var allCameras;
		var cameraParams;
		var scene;
		var domEl;
		var lookAt = new THREE.Vector3();

		
		var toggleCamera = function() {
			viewSettings.lookFrom = trackOptionSelectors.from.val();
			viewSettings.lookAt = trackOptionSelectors.at.val();
			disableControls();


			var lookFromBody = bodies3d[viewSettings.lookFrom];
			var lookAtBody = bodies3d[viewSettings.lookAt];

			TracerManager.setTraceFrom();

			if(lookFromBody){
				currentCamera = lookFromBody.getCamera(POV_CAMERA_TYPE);
				domEl.on('mousewheel', onMouseWheel);

				//if we look from a body to another, trace the lookat body's path relative to the pov UNLESS the look target is orbiting to the pov
				if(lookAtBody && !lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
					TracerManager.setTraceFrom(lookFromBody, lookAtBody);
				}

			} else {
				domEl.off('mousewheel');

				//if we want to look from an orbital camera, check if it is to look at a particular body or to the whole system
				if(viewSettings.lookFrom == ORBITAL_CAMERA_TYPE){
					currentCamera = (lookAtBody && lookAtBody.getCamera(ORBITAL_CAMERA_TYPE)) || globalCamera;
					currentCamera.jsorrery && currentCamera.jsorrery.controls && (currentCamera.jsorrery.controls.enabled = true);
				}
			}

			Gui.toggleOptions(Gui.LOOKAT_ID, toggling_at_options, !!lookFromBody);

			ExportValues.setCamera(currentCamera);

			//we show/hide orbits and ecliptics depending on what bodies are of interest
			OrbitLinesManager.onCameraChange(lookFromBody, lookAtBody);

			updateCamera();
			scene.draw();
		};

		var getScaledVector = function(v){
			return Dimensions.getScaled(v.clone());
		};

		var updateCamera = function() {

			if(typeof viewSettings.lookFrom == 'undefined') toggleCamera();

			var lookFromBody = bodies3d[viewSettings.lookFrom];
			

			var lookAtBody = bodies3d[viewSettings.lookAt];
			var controls = currentCamera.jsorrery && currentCamera.jsorrery.controls;
			if(controls) {
				controls.update();
			} else if(viewSettings.lookFrom) {

				if(lookAtBody) {
					lookAt.copy(lookAtBody.getPosition()).sub(lookFromBody.getPosition());	
				} else if(viewSettings.lookAt == 'night') {
					lookAt.copy(lookFromBody.getPosition());
					lookAt.multiplyScalar(2);
				} else if('front,back'.indexOf(viewSettings.lookAt) !== -1) {
					var vel = lookFromBody.celestial.movement;
					lookAt.copy(vel).normalize();
					if(viewSettings.lookAt=='back') lookAt.negate();
				} else {
					lookAt.set(0, 0, 0).sub(lookFromBody.getPosition());
				}
			
				currentCamera.lookAt(lookAt);
			}

		};

		var onMouseWheel = function(event, delta, deltaX, deltaY) {
			delta = delta / Math.abs(delta);
			currentCamera.fov += currentCamera.fov * 0.1 * -delta;
			if(currentCamera.fov > MAX_FOV) currentCamera.fov = MAX_FOV;
			currentCamera.updateProjectionMatrix();
			scene.draw();
		};

		var onControlsUpdate = function(){
			if(!ns.U.isPlaying()) scene.draw();
		};

		var getDistanceFromFov = function(dimToSee, fov){
			return dimToSee * Math.atan(fov * 2 * ns.DEG_TO_RAD);
		};

		var getNewCamera = function(isOrbital){
			var cam = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, cameraParams.near, cameraParams.far);
			cam.up = new THREE.Vector3(0,0,1);

			if(isOrbital){
				var controls = new THREE.OrbitControls(cam, domEl.get(0));
				//set the controls as a property of the camera, but namespaced
				cam.jsorrery = cam.jsorrery || {};
				cam.jsorrery.controls = controls;
				controls.addEventListener('change', onControlsUpdate);
				controls.center.set(0, 0, 0);
				controls.enabled = false;
			}

			allCameras.push(cam);
			return cam;
		};

		var disableControls = function(){
			_.each(allCameras, function(cam){
				cam.jsorrery && cam.jsorrery.controls && (cam.jsorrery.controls.enabled = false);
			});
		};

		var CM = {
			init : function(sceneParam, aspect, fov, stageSize, container){
				scene = sceneParam;
				domEl = container;
				allCameras = [];
				bodies3d = {};
				viewSettings = {};
				cameraParams = {
					fov : fov || DEFAULT_FOV,
					aspect : aspect,
					near : 0.001,
					far : stageSize * 5
				};

				globalCamera = getNewCamera(true);
				globalCamera.position.set(0, -1, getDistanceFromFov(stageSize, globalCamera.fov));

				scene.root.add(globalCamera);

				trackOptionSelectors = {
					from: Gui.addDropdown(Gui.LOOKFROM_ID, toggleCamera),
					at : Gui.addDropdown(Gui.LOOKAT_ID, toggleCamera)
				};
				
				Gui.addOption(Gui.LOOKFROM_ID, 'Free camera', 'orbital');
				Gui.addOption(Gui.LOOKAT_ID, 'System', 'universe');

				if(ns.U.getBody().name == 'sun') {
					Gui.addOption(Gui.LOOKAT_ID, 'Night (away from the sun)', 'night');
				}
				
				Gui.addOption(Gui.LOOKAT_ID, 'Direction of velocity', 'front');
				Gui.addOption(Gui.LOOKAT_ID, 'Inverse direction of velocity', 'back');

			},

			putDefaults : function(settings) {
				//console.log(settings);
				if(settings) {
					currentCamera.position.x = Number(settings.x) || 0;
					currentCamera.position.y = Number(settings.y) || 0;
					currentCamera.position.z = Number(settings.z) || 0;
					currentCamera.fov = Number(settings.fov) || DEFAULT_FOV;
					currentCamera.updateProjectionMatrix();
				}
			},

			addBody : function(body3d){				
				Gui.addOption(Gui.LOOKFROM_ID, body3d.celestial.title, body3d.celestial.name);
				Gui.addOption(Gui.LOOKAT_ID, body3d.celestial.title, body3d.celestial.name);

				var getCamPos = function(){
					return body3d.root.localToWorld(this.position.clone());
				};

				var pov = getNewCamera();
				pov.getAbsolutePos = getCamPos;
				body3d.addCamera(POV_CAMERA_TYPE, pov);

				var orbital = getNewCamera(true);
				orbital.getAbsolutePos = getCamPos;
				orbital.position.set(0, -1, body3d.getPlanetStageSize() * 200);

				body3d.addCamera(ORBITAL_CAMERA_TYPE, orbital);

				bodies3d[body3d.celestial.name] = body3d;
			},

			updateCamera : function(){
				updateCamera();
				return currentCamera;
			},

			getCamera : function(){
				if(typeof viewSettings.lookFrom == 'undefined') toggleCamera();
				return currentCamera;
			},

			updateCameraMatrix : function(){
				currentCamera && currentCamera.parent && currentCamera.parent.updateMatrixWorld();
			},

			kill : function(){
				Gui.remove(Gui.LOOKAT_ID);
				Gui.remove(Gui.LOOKFROM_ID);
				domEl && domEl.off('mousewheel');

				_.each(allCameras, function(cam){
					cam.jsorrery && cam.jsorrery.controls && cam.jsorrery.controls.removeEventListener('change', onControlsUpdate);
				});
			}

		};

		return CM;

	});
