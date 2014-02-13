
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/Body3d',
		'jsorrery/graphics3d/MilkyWayParticles',
		'jsorrery/graphics3d/Sun',
		'jsorrery/graphics3d/CameraManager',
		'jsorrery/graphics3d/OrbitLinesManager',
		'jsorrery/graphics3d/TracerManager',
		'jsorrery/graphics2d/Labels',
		'jsorrery/graphics3d/Dimensions',
		'jsorrery/gui/Gui',
		'jsorrery/graphics3d/Screenshot',
		'vendor/jquery.mousewheel',
		'three/stats',
		'_'
	], 
	function(ns, $, Body3D, MilkyWay, Sun, CameraManager, OrbitLinesManager, TracerManager, Labels, Dimensions, Gui, Screenshot){
		'use strict';

		var stats;
		var renderer;

		var drawBody = function(b){
			b.drawMove();
		};

		return {
			createStage : function(scenario) {

				this.bodies3d = [];

				this.container = $('<div id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.root = new THREE.Scene();				

				renderer = renderer || new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});

				if(ns.capture) this.screenshot = Object.create(Screenshot).init(renderer);

				//renderer.shadowMapEnabled = true;
				renderer.setSize(this.width, this.height);

				var light = new THREE.AmbientLight( 0x202020 );
				this.root.add( light );/**/

				if(!stats) {
					stats = new Stats();
					$('body').append( stats.domElement );
				}

				this.container.append(renderer.domElement);
				
				//planet scale
				Gui.addSlider(Gui.PLANET_SCALE_ID, null, function(val){
					_.each(this.bodies3d, function(body3d){
						body3d.setScale(val);
					});
					this.draw();
				}.bind(this));

				//this.drawAxis();
				CameraManager.init(this, this.width/this.height, scenario.fov, this.stageSize, this.container);
				OrbitLinesManager.init(this.root);
				TracerManager.init(this.root);

				this.setMilkyway();

			},

			setCameraDefaults : function(settings) {
				CameraManager.putDefaults(settings);
			},

			setMilkyway : function(){
				var milkyway = this.milkyway = Object.create(MilkyWay);
				var onReady = milkyway.init(this.stageSize * 6);
				this.root.add(milkyway.getDisplayObject());
			},


			setSun : function(){

				var sun = this.sun = Object.create(Sun);
				sun.init();
				var hasCelestial = this.centralBody && this.centralBody.name == 'sun';
				sun.setLight(hasCelestial);
				 
				this.root.add(sun.getDisplayObject());

			},

			/*
			drawAxis : function(){
				var object = new THREE.AxisHelper(this.stageSize/10);
			 	object.position.x = 0;//r
			 	object.position.y = 0;//g
			 	object.position.z = 0;//b
			  	this.root.add( object );
			},/**/

			setDimension : function(largestSMA, smallestSMA, largestRadius) {
				this.width = $(window).width();
				this.height = $(window).height();
				Dimensions.setLargestDimension(largestSMA);
				this.stageSize = Dimensions.getScaled(largestSMA);
				this.smallestSMA = smallestSMA;
			},

			draw : function(){
				
				_.each(this.bodies3d, drawBody);
				//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
				CameraManager.updateCameraMatrix();
				var camPos = (CameraManager.getCamera().getAbsolutePos && CameraManager.getCamera().getAbsolutePos() ) || CameraManager.getCamera().position;

				//move sun, if its not a body shown. This assumes that the central body, if it has an orbit, revolves around the sun
				if(this.sun && this.centralBody && this.centralBody.orbit){
					var pos = this.centralBody.calculatePosition(ns.U.currentTime);
					pos.setLength(this.stageSize * 4).negate();
					this.sun.setPosition(pos);
				} else if(this.sun){
					var sunPos = this.centralBody.getBody3D().getPosition();
					this.sun.setPosition(sunPos);/**/
					this.sun.setFlarePosition(camPos.clone().sub(sunPos).multiplyScalar(0.2));/**/
					this.sun.setFlareSize(this.centralBody.getBody3D().getScreenSizeRatio(camPos, CameraManager.getCamera().fov), this.height);/**/
				}

				TracerManager.draw();

				//center the milkyway to the camera position, to make it look infinite
				this.milkyway && this.milkyway.setPosition(camPos);

				renderer.render(this.root, CameraManager.getCamera());
				this.screenshot && this.screenshot.capture();

				//place planets labels. We need the camera position relative to the world in order to compute planets screen sizes, and hide/show labels depending on it
				var radFov = CameraManager.getCamera().fov * ns.DEG_TO_RAD;
				var camPos = CameraManager.getCamera().position.clone();
				camPos.applyMatrix4(CameraManager.getCamera().matrixWorld);
				Labels.draw(camPos, radFov);
				/**/
				stats.update();
			},

			//camera might move and/or look at a different point depending on bodies movements
			updateCamera : function(){
				CameraManager.updateCamera();
			},

			//when the date has changed by the user instead of by the playhead, we need to recalculate the orbits and redraw
			onDateReset : function() {
				this.updateCamera();
				OrbitLinesManager.resetAllOrbits();
				TracerManager.resetTrace();
				this.draw();
			},

			addBody : function(celestialBody) {
				var body3d = Object.create(Body3D);

				body3d.init(celestialBody);
				this.bodies3d.push(body3d);
				body3d.setParentDisplayObject(this.root);
				
				CameraManager.addBody(body3d);
				OrbitLinesManager.addBody(body3d);
				TracerManager.addBody(body3d);
			},

			getRoot : function(){
				return this.root;
			},

			setCentralBody : function(centralBody){
				this.centralBody = centralBody;
				//make sure that any celestial body cannot be larger than the central celestial body
				var central3d = centralBody.getBody3D();
				//central body's scale is at most x% of the nearest orbit
				central3d.maxScale = (this.smallestSMA / (centralBody.radius*ns.KM)) * 0.2;
				central3d.maxScale = central3d.maxScale < 1 ? 1 : central3d.maxScale;

				var maxDim = central3d.maxScale * centralBody.radius*ns.KM;
				var maxScaleVal = 0;
				_.each(this.bodies3d, function(body3d){
					body3d.maxScale = (maxDim / (body3d.celestial.radius*ns.KM));
					maxScaleVal = maxScaleVal > body3d.maxScale ? maxScaleVal : body3d.maxScale;
				});
				//console.log(maxScaleVal);
				this.setSun();
			},

			kill : function(){
				CameraManager.kill();
				OrbitLinesManager.kill();
				TracerManager.kill();
				Gui.remove(Gui.PLANET_SCALE_ID);
				this.container.remove();

			}
		};

	}
);