

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
		var freeCamera;
		var controls;
		var scene;
		var domEl;
		var freeDefaultSettings;
		var lookAt = new THREE.Vector3();

		var toggleFreeCamera = function(i){
			resetTraceBehaviors();
			controls.enabled = true;
			viewSettings.isFree = true;
			freeCamera.lookAt(new THREE.Vector3(0,0,0));
			
			trackOptionSelectors.from.val('');
			trackOptionSelectors.at.val('');
			domEl.off('mousewheel');
			scene.draw();
		};

		var onControlsUpdate = function(){
			scene.draw();
		};
		
		/**
		Reset the default behavior of every body's tracer (that is, trace from global)
		*/
		var resetTraceBehaviors = function(){
			$.each(bodies, function(i, body){
				body.attachTrace();
				body.setTraceFrom(null);
				body.removeTracerEventsListeners();
			});
		};
		
		var toggleTrackBody = function() {
			viewSettings.lookFrom = trackOptionSelectors.from.val();
			viewSettings.lookAt = trackOptionSelectors.at.val();

			resetTraceBehaviors();

			if(bodies[viewSettings.lookFrom]){
				controls.enabled = false;

				//remove current lookfrom body's tracer
				bodies[viewSettings.lookFrom].detachTrace();			

				if(bodies[viewSettings.lookAt]) {
					bodies[viewSettings.lookAt].setTraceFrom(bodies[viewSettings.lookFrom]);
					//also listen to the "from" body tracer events to trace the "at" body, as the latter's rythm might not be sufficient
					bodies[viewSettings.lookAt].addTracerEventsListeners(bodies[viewSettings.lookFrom].celestial);
					domEl.on('mousewheel', onMouseWheel);
				}
			} else {

				domEl.off('mousewheel');

				if(viewSettings.lookFrom == 'orbital'){
					controls.enabled = true;
					freeCamera.position.set(freeDefaultSettings.x, freeDefaultSettings.y, freeDefaultSettings.z);
					freeCamera.fov = freeDefaultSettings.fov;
				}
			}
			scene.draw();
		};

		var getScaledVector = function(v){
			var out = v.clone().multiplyScalar(ns.SCALE_3D);
			return out;
		};

		var updateCamera = function(isPlaying) {

			if(typeof viewSettings.lookFrom == 'undefined') toggleTrackBody();

			var lookFromBody = bodies[viewSettings.lookFrom];
			var lookAtBody = bodies[viewSettings.lookAt];

			if(controls && controls.enabled) {
				var centralBody = (lookAtBody && lookAtBody.celestial) || ns.U.getBody();
				controls.center.copy(getScaledVector(centralBody.position));
				if(isPlaying && lookAtBody){
					freeCamera.position.add(getScaledVector(lookAtBody.celestial.movement));
				} 
				controls.update();
			} else if(viewSettings.lookFrom) {

				var cameraPos = freeCamera.position;
				if(lookFromBody) {
					cameraPos.copy(lookFromBody.getPlanet().position);
				} else {
					cameraPos.x = cameraPos.y = cameraPos.z = 0;
				}

				if(viewSettings.lookAt){
					if(lookAtBody) {
						lookAt.copy(lookAtBody.getPlanet().position);	
					} else if(viewSettings.lookAt == 'night') {
						lookAt.copy(cameraPos);
						lookAt.multiplyScalar(2);
					} else if('front,back'.indexOf(viewSettings.lookAt) !== -1) {
						var vel = lookFromBody.celestial.movement;
						lookAt.copy(vel).normalize();
						if(viewSettings.lookAt=='back') lookAt.negate();
						lookAt.add(cameraPos);
					} else {
						//default vernal equinox
						lookAt.copy(cameraPos);
						lookAt.x -= 1;
					}
				} else {
					lookAt.x = lookAt.y = lookAt.z = 0;
				}

				freeCamera.lookAt(lookAt);
			}

			//this.camera.updateMatrixWorld();
			//freeCamera.updateProjectionMatrix();
		};

		var onMouseWheel = function(event, delta, deltaX, deltaY) {
			delta = delta / Math.abs(delta);
			freeCamera.fov += freeCamera.fov * 0.1 * delta;
		};

		var onControlsUpdate = function(){
			if(!ns.U.isPlaying()) scene.draw();
		};

		var setControls = function() {

			controls && controls.removeEventListener('change', onControlsUpdate);
			controls = new THREE.OrbitControls(freeCamera, domEl.get(0));
			controls.addEventListener('change', onControlsUpdate);
			controls.center.set(0, 0, 0);
		};

		var getFOVFromDistance = function(obj, dist) {

		};

		var getDistanceFromFov = function(dimToSee, fov){
			return dimToSee * Math.atan(fov * 2 * ns.DEG_TO_RAD);
		};

		var CM = {
			init : function(sceneParam, aspect, fov, stageSize, container){
				scene = sceneParam;
				domEl = container;
				freeCamera = new THREE.PerspectiveCamera(fov || defaultCameraFov, aspect, 1, stageSize * 10);
				freeCamera.up = new THREE.Vector3(0,0,1);

				setControls();

				domEl.on('mouseup.jsorrery', function(){scene.draw();});
				scene.root.add(freeCamera);

				freeDefaultSettings = {
					fov : fov || defaultCameraFov,
					x : 0,
					y : 0,
					z : getDistanceFromFov(stageSize, freeCamera.fov)
				};

				bodies = [];
				viewSettings = {};

				//Gui.addBtn('free camera', '', toggleFreeCamera);

				trackOptionSelectors = {
					from: Gui.addDropdown('lookFrom', 'Look from', toggleTrackBody),
					at : Gui.addDropdown('lookAt', 'Look at', toggleTrackBody)
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
				bodies.push(b);
			},

			updateCamera : function(isPlaying){
				updateCamera(isPlaying);
				return freeCamera;
			},

			getCamera : function(){
				return freeCamera;
			}

		};

		return CM;

	});
