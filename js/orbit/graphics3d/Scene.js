
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Body3d',
		'orbit/graphics3d/MilkyWayParticles',
		'orbit/graphics3d/Sun',
		'orbit/graphics3d/CameraManager',
		'orbit/graphics3d/OrbitLinesManager',
		'orbit/graphics3d/TracerManager',
		'orbit/graphics3d/Dimensions',
		'orbit/gui/Gui',
		'vendor/jquery.mousewheel',
		'three/stats',
		'_'
	], 
	function(ns, $, Body3D, MilkyWay, Sun, CameraManager, OrbitLinesManager, TracerManager, Dimensions, Gui){
		'use strict';
		var projector;
		var stats;

		return {
			createStage : function(scenario) {
			
				projector = projector || new THREE.Projector();
				this.bodies3d = [];

				this.container = $('<div id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.root = new THREE.Scene();				

				this.renderer = new THREE.WebGLRenderer({antialias: true});
				//this.renderer.shadowMapEnabled = true;
				this.renderer.setSize(this.width, this.height);

				var ambiance = new THREE.DirectionalLight(0xFFFFFF, 0.1);
				ambiance.position.x = 0;
				ambiance.position.y = 5 * this.stageSize;
				ambiance.position.z = 5 * this.stageSize;

				var light = new THREE.AmbientLight( 0x202020 );
				this.root.add( light );

				if(!stats) {
					stats = new Stats();
					$('body').append( stats.domElement );
				}

				this.onTextureLoaded = this.draw.bind(this);

				this.container.append(this.renderer.domElement);
				
				Gui.addSlider(Gui.PLANET_SCALE_ID, function(val){
					_.each(this.bodies3d, function(body3d){
						body3d.setScale(val);
					});
					this.draw();
				}.bind(this));

				//this.drawAxis();
				this.cameraManager = Object.create(CameraManager);
				this.cameraManager.init(this, this.width/this.height, scenario.fov, this.stageSize, this.container);
				OrbitLinesManager.init(this.root);

				var onInitialized = this.setMilkyway();
				return onInitialized;
			},

			setMilkyway : function(){
				var milkyway = this.milkyway = Object.create(MilkyWay);
				var onReady = milkyway.init(this.stageSize * 4);
				this.root.add(milkyway.getDisplayObject());

				return onReady;
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

			toXYCoords:function (pos) {
		        var vector = projector.projectVector(pos, this.cameraManager.getCamera());
		        vector.x = (vector.x + 1)/2 * this.width;
		        vector.y = -(vector.y - 1)/2 * this.height;/**/
		        return vector;
			},

			draw : function(){
				
				//move sun, if its not a body shown. This assumes that the central body, if it has an orbit, revolves around the sun
				if(this.sun && this.centralBody && this.centralBody.orbit){
					var pos = this.centralBody.calculatePosition(ns.U.currentTime);
					pos.setLength(this.stageSize * 5).negate();
					this.sun.setPosition(pos);
				}

				_.each(this.bodies3d, function(b){
					b.drawMove();
				}.bind(this));

				//center the milkyway to the camera position, to make it look infinite
				this.milkyway && this.milkyway.setPosition(this.cameraManager.getCamera().position);

				this.renderer.render(this.root, this.cameraManager.getCamera());

				//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
				this.cameraManager.updateCameraMatrix();
				//place planets labels. We need the camera position relative to the world in order to compute planets screen sizes, and hide/show labels depending on it
				var radFov = this.cameraManager.getCamera().fov * ns.DEG_TO_RAD;
				var camPos = this.cameraManager.getCamera().position.clone();
				camPos.applyMatrix4(this.cameraManager.getCamera().matrixWorld);
				_.each(this.bodies3d, function(b){
					b.placeLabel(this.toXYCoords(b.getPosition()), this.width, this.height, camPos, radFov);
				}.bind(this));

				stats.update();
			},

			//camera might move and/or look at a different point depending on bodies movements
			updateCamera : function(){
				this.cameraManager.updateCamera();
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
				
				this.cameraManager.addBody(body3d);
				OrbitLinesManager.addBody(body3d);
				
				this.waitForTexture(celestialBody.map);
			},

			waitForTexture : function(mapSrc){
				if(!mapSrc) return;
				var textureImg = new Image();
		        textureImg.onload = this.onTextureLoaded;
		        textureImg.src = mapSrc;
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
				this.cameraManager.kill();
				OrbitLinesManager.kill();
				Gui.remove(Gui.PLANET_SCALE_ID);
				_.each(this.bodies3d, function(body3d){
					body3d.kill();
				});
				this.container.remove();

			}
		};

	}
);