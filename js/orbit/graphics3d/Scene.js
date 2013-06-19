
define(
	[
		'orbit/NameSpace',
		'jquery',
		'_',
		'orbit/graphics3d/Body',
		'orbit/gui/Gui',
		'vendor/jquery.mousewheel',
		'three/controls/OrbitControls',
		'three/stats'
	], 
	function(ns, $, _, BodyGraphics, Gui){
		var projector;
		var defaultCameraFov = 45;
		var stats;
		var lookAt = new THREE.Vector3();

		return {
			createStage : function(Scenario) {

				projector = projector || new THREE.Projector();
				this.bodies = {};
				this.rendrables = [];

				this.container = $('<div id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');

				this.scene = new THREE.Scene();
				//this.scene.fog = new THREE.Fog( 0x00aaff, 100, 10000 );

				this.renderer = new THREE.WebGLRenderer({antialias: true});
				//this.renderer.shadowMapEnabled = true;
				this.renderer.setSize(this.width, this.height);

				this.camera = new THREE.PerspectiveCamera(Scenario.fov || defaultCameraFov, this.width / this.height, 0.1, 100000);
				this.camera.up = new THREE.Vector3(0,0,1);
				this.controls = new THREE.OrbitControls(this.camera, this.container.get(0));
				this.container.on('mouseup.jsorrery', this.draw.bind(this));
				this.scene.add(this.camera);

				var ambiance = new THREE.DirectionalLight(0xFFFFFF, 0.1);
				ambiance.position.x = 0 * this.height;
				ambiance.position.y = 5 * this.width;
				ambiance.position.z = 5 * this.width;

				var sun;
				if(this.centralBody && this.centralBody.name == 'sun') {
					sun = new THREE.PointLight(0xFFFFFF);
					sun.position.x = 0;
					sun.position.y = 0;
					sun.position.z = 0;
				} else {
					sun = new THREE.DirectionalLight(0xFFFFFF, 1);
					//sun.castShadow = true;
					sun.position.x = -1 * this.width;
					sun.position.y = 0 * this.width;
					sun.position.z = 0 * this.width;
					this.sun = sun;
				}

				this.scene.add(sun);

				//this.scene.add(ambiance);

				var light = new THREE.AmbientLight( 0x101010 ); // soft white light
				this.scene.add( light );/***/

				//this.drawAxis();

				Gui.addBtn('free camera', '', function(){
					this.toggleFreeCamera();
				}.bind(this));
				
				this.trackFromSelect = Gui.addDropdown('lookFrom', 'Look from', this.toggleTrackBody.bind(this));
				this.trackLookatSelect = Gui.addDropdown('lookAt', 'Look at', this.toggleTrackBody.bind(this));
				Gui.addOption('lookFrom', '', '');
				Gui.addOption('lookAt', '', '');

				$.each(Scenario.bodies, function(bodyName, b){
					Gui.addOption('lookFrom', bodyName, bodyName);
					Gui.addOption('lookAt', bodyName, bodyName);
				});
				Gui.addOption('lookAt', 'vernal equinox', 'vernal');
				if(Scenario.bodies.sun) {
					Gui.addOption('lookAt', 'night (away from the sun)', 'night');
				}
				
				Gui.addOption('lookAt', 'direction of velocity', 'front');
				Gui.addOption('lookAt', 'inverse direction of velocity', 'back');
				Gui.addOption('lookFrom', 'above from the '+ns.U.getBody().name, 'above');


				stats = new Stats();
				$('body').append( stats.domElement );

				this.container.append(this.renderer.domElement);

				this.viewSettings = {};
				this.toggleFreeCamera();

			},

			toggleTrackBody : function() {
				this.viewSettings.isFree = false;
				this.viewSettings.lookFrom = this.trackFromSelect.val();
				this.viewSettings.lookAt = this.trackLookatSelect.val();

				this.cancelTraceFrom();

				if(this.bodies[this.viewSettings.lookFrom] && this.bodies[this.viewSettings.lookAt]) {
					this.bodies[this.viewSettings.lookAt].setTraceFrom(this.bodies[this.viewSettings.lookFrom]);
					//also listen to the "from" body tracer events to trace the "at" body, as the latter's rythm might not be sufficient
					this.bodies[this.viewSettings.lookAt].addTracerEventsListeners(this.bodies[this.viewSettings.lookFrom].celestial);
				}
				this.container.on('mousewheel', this.onMouseWheel.bind(this));
				this.draw();
			},

			toggleFreeCamera : function(i){

				this.cancelTraceFrom();

				this.viewSettings.isFree = true;
				this.camera.position.z = this.height*0.9;
				this.camera.position.y = -this.height*0.9;
				this.camera.position.x = 0;
				this.camera.lookAt(new THREE.Vector3(0,0,0));
				
				this.trackFromSelect.val('');
				this.trackLookatSelect.val('');
				this.container.off('mousewheel');
				this.draw();

			},

			cancelTraceFrom : function(){
				$.each(this.bodies, function(i, body){
					body.setTraceFrom(null);
					body.removeTracerEventsListeners();
				});
			},

			onMouseWheel : function(event, delta, deltaX, deltaY) {
				delta = delta / Math.abs(delta);
				this.camera.fov += this.camera.fov * 0.1 * delta;
			},

			drawAxis : function(){
				var object = new THREE.AxisHelper(this.width/10);
	         	object.position.x = 0;
	         	object.position.y = 0;
	         	object.position.z = 0;
		      	this.scene.add( object );
			},

			setDimension : function(largestSMA, largestRadius) {

				this.width = $(window).width();
				this.height = $(window).height();

				var nPixPerAU = ((this.height / 2) - 20) / (largestSMA / ns.AU);
				var nkmPerPix = ns.AU / nPixPerAU;
				BodyGraphics.nmPerPix = this.nmPerPix = nkmPerPix * 1000;
				var largestPxRadius = largestRadius / nkmPerPix;
				if(largestPxRadius < ns.largestBodyMinimalSize) {
					largestPxRadius = ns.largestBodyMinimalSize;
				}
				this.radiusKmPerPix = largestRadius / largestPxRadius;
			},

			toXYCoords:function (pos) {
		        var vector = projector.projectVector(pos, this.camera);
		        vector.x = (vector.x + 1)/2 * this.width;
		        vector.y = -(vector.y - 1)/2 * this.height;/**/

		        return vector;
			},

			draw : function(){

				//move sun, if its not a body shown. This assumes that the central body, if it has an orbit, revolves around the sun
				if(this.sun && this.centralBody && this.centralBody.orbit){
					var pos = this.centralBody.calculatePosition(ns.U.currentTime);
					pos.setLength(this.width*3).negate();
					this.sun.position.copy(pos);
				}

				$.each(this.rendrables, function(n, b){
					b.drawMove();
					/*var labelPos = this.toXYCoords(b.getPlanet().position.clone());
					if(labelPos.x>0 && labelPos.x<this.width && labelPos.y>0 && labelPos.y<this.height) {
						b.placeLabel(labelPos);
					}/**/
				}.bind(this));
				
				if(this.viewSettings.isFree && this.controls) {
					this.controls.update();
				} else if(this.viewSettings.lookFrom) {

					var cameraPos = this.camera.position;
					if(this.bodies[this.viewSettings.lookFrom]) {
						cameraPos.copy(this.bodies[this.viewSettings.lookFrom].getPlanet().position);
					} else {
						cameraPos.x = cameraPos.y = cameraPos.z = 0;
					}

					if(this.viewSettings.lookAt){
						if(this.bodies[this.viewSettings.lookAt]) {
							lookAt.copy(this.bodies[this.viewSettings.lookAt].getPlanet().position);	
						} else if(this.viewSettings.lookAt == 'night') {
							lookAt.copy(cameraPos);
							lookAt.multiplyScalar(2);
						} else if('front,back'.indexOf(this.viewSettings.lookAt) !== -1) {
							var vel = this.bodies[this.viewSettings.lookFrom].celestial.movement;
							lookAt.copy(vel).normalize();
							if(this.viewSettings.lookAt=='back') lookAt.negate();
							lookAt.add(cameraPos);
						} else {
							//default vernal equinox
							lookAt.copy(cameraPos);
							lookAt.x -= 1;
						}
					} else {
						lookAt.x = lookAt.y = lookAt.z = 0;
					}

					if(this.viewSettings.lookFrom == 'above'){
						cameraPos.copy(lookAt);
						cameraPos.multiplyScalar(2);
					}

					this.camera.lookAt(lookAt);
				}

				//this.camera.updateMatrixWorld();
				this.camera.updateProjectionMatrix();

				this.renderer.render(this.scene, this.camera);
				stats.update();
			},


			addBody : function(celestialBody) {
				var graphics = Object.create(BodyGraphics);

				var pxRadius = celestialBody.radius / this.radiusKmPerPix;
				//pxRadius = pxRadius < ns.smallestBodyMinimalSize ? ns.smallestBodyMinimalSize : pxRadius;
				graphics.pxRadius = pxRadius;

				graphics.init(celestialBody);
				this.bodies[celestialBody.name] = graphics;
				this.rendrables.push(graphics);
				this.scene.add(graphics.getPlanet());
				var t = graphics.getTracer();
				if(t) this.scene.add(t);

				if(celestialBody.map){
					var textureImg = new Image();
			        textureImg.onload = function(){
			            this.draw();
			        }.bind(this);
			        textureImg.src = celestialBody.map;
			    }
			},

			setCentralBody : function(centralBody){
				this.centralBody = centralBody;
			}
		};

	}
);