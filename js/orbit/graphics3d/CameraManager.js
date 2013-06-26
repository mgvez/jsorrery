

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/gui/Gui',
		'three/controls/OrbitControls',
		'three'
	], 
	function(ns, $, Gui) {

		var defaultCameraFov = 45;
		var bodies;
		var trackOptionSelectors;
		var viewSettings;
		var globalCamera;
		var currentCamera;
		var scene;
		var domEl;
		var lookAt = new THREE.Vector3();


		var onControlsUpdate = function(){
			scene.draw();
		};
		
		/**
		Reset the default behavior of every body's orbit line (show the orbit, not the ecliptic)
		*/
		var resetShownOrbit = function(){
			$.each(bodies, function(i, body){
				body.hideEcliptic();
				body.showOrbit();
			});
		};
		
		var toggleCamera = function() {
			viewSettings.lookFrom = trackOptionSelectors.from.val();
			viewSettings.lookAt = trackOptionSelectors.at.val();
			disableControls();
			resetShownOrbit();

			var lookFromBody = bodies[viewSettings.lookFrom];
			var lookAtBody = bodies[viewSettings.lookAt];

			if(lookFromBody){
				currentCamera = lookFromBody.getCamera('pov');
				lookFromBody.showEcliptic();
				lookFromBody.hideOrbit();

				if(lookAtBody) {
					lookAtBody.hideOrbit();
					domEl.on('mousewheel', onMouseWheel);
				}
			} else {

				domEl.off('mousewheel');

				if(viewSettings.lookFrom == 'orbital'){
					currentCamera = (lookAtBody && lookAtBody.getCamera('orbital')) || globalCamera;
					currentCamera.jsorrery && currentCamera.jsorrery.controls && (currentCamera.jsorrery.controls.enabled = true);
				}
			}
			scene.draw();
		};

		var getScaledVector = function(v){
			var out = v.clone().multiplyScalar(ns.SCALE_3D);
			return out;
		};

		var updateCamera = function(isPlaying) {

			if(typeof viewSettings.lookFrom == 'undefined') toggleCamera();

			var lookFromBody = bodies[viewSettings.lookFrom];
			var lookAtBody = bodies[viewSettings.lookAt];
			var controls = currentCamera.jsorrery && currentCamera.jsorrery.controls;
			if(controls) {
				controls.update();
			} else if(viewSettings.lookFrom) {

				if(viewSettings.lookAt){
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
						//default vernal equinox
						lookAt.set(-1, 0, 0);
					}
				} else {
					lookAt.x = lookAt.y = lookAt.z = 0;
				}

				currentCamera.lookAt(lookAt);
			}

			//currentCamera.updateMatrixWorld();
			//currentCamera.updateProjectionMatrix();
		};

		var onMouseWheel = function(event, delta, deltaX, deltaY) {
			delta = delta / Math.abs(delta);
			globalCamera.fov += globalCamera.fov * 0.1 * delta;
		};

		var onControlsUpdate = function(){
			if(!ns.U.isPlaying()) scene.draw();
		};

		var getFOVFromDistance = function(obj, dist) {

		};

		var getDistanceFromFov = function(dimToSee, fov){
			return dimToSee * Math.atan(fov * 2 * ns.DEG_TO_RAD);
		};

		var allCameras = [];
		var cameraParams;
		var getNewCamera = function(isOrbital){
			var cam = new THREE.PerspectiveCamera(cameraParams.fov, cameraParams.aspect, cameraParams.near, cameraParams.far);
			cam.up = new THREE.Vector3(0,0,1);

			if(isOrbital){
				var controls = new THREE.OrbitControls(cam, domEl.get(0));
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
				cameraParams = {
					fov : fov || defaultCameraFov,
					aspect : aspect,
					near : 1,
					far : stageSize * 10
				};

				globalCamera = getNewCamera(true);
				globalCamera.position.set(0, 0, getDistanceFromFov(stageSize, globalCamera.fov));

				scene.root.add(globalCamera);

				bodies = [];
				viewSettings = {};

				trackOptionSelectors = {
					from: Gui.addDropdown('lookFrom', 'Look from', toggleCamera),
					at : Gui.addDropdown('lookAt', 'Look at', toggleCamera)
				};
				
				Gui.addOption('lookFrom', 'orbital camera', 'orbital');
				Gui.addOption('lookAt', 'whole system', 'universe');

				Gui.addOption('lookAt', 'vernal equinox', 'vernal');
				if(ns.U.getBody().name == 'sun') {
					Gui.addOption('lookAt', 'night (away from the sun)', 'night');
				}
				
				Gui.addOption('lookAt', 'direction of velocity', 'front');
				Gui.addOption('lookAt', 'inverse direction of velocity', 'back');

			},

			addBody : function(b){				
				Gui.addOption('lookFrom', b.getName(), bodies.length);
				Gui.addOption('lookAt', b.getName(), bodies.length);

				var pov = getNewCamera();
				b.addCamera('pov', pov);

				var orbital = getNewCamera(true);

				orbital.position.set(0, 0, b.getPlanetStageSize() * 1000);

				b.addCamera('orbital', orbital);

				bodies.push(b);
			},

			updateCamera : function(isPlaying){
				updateCamera(isPlaying);
				return currentCamera;
			},

			getCamera : function(){
				return currentCamera;
			}

		};

		return CM;

	});
