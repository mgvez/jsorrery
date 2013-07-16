
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Body3d',
		'orbit/graphics3d/CameraManager',
		'orbit/graphics3d/TracerManager',
		'orbit/gui/Gui',
		'vendor/jquery.mousewheel',
		'three/stats',
		'_'
	], 
	function(ns, $, Body3D, CameraManager, TracerManager, Gui){

		var projector;
		var stats;
		var SCALE_CTRL_ID = 'scaleCtrl';

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

				var sun;
				if(this.centralBody && this.centralBody.name == 'sun') {
					sun = new THREE.PointLight(0xFFFFFF);
					sun.position.x = 0;
					sun.position.y = 0;
					sun.position.z = 0;
				} else {
					sun = new THREE.DirectionalLight(0xFFFFFF, 1);
					//sun.castShadow = true;
					sun.position.x = -1 * this.stageSize;
					sun.position.y = 0 * this.stageSize;
					sun.position.z = 0 * this.stageSize;
					this.sun = sun;
				}

				this.root.add(sun);

				var light = new THREE.AmbientLight( 0x202020 );
				this.root.add( light );

				if(!stats) {
					stats = new Stats();
					$('body').append( stats.domElement );
				}

				this.container.append(this.renderer.domElement);

				//this.drawAxis();
				CameraManager.init(this, this.width/this.height, scenario.fov, this.stageSize, this.container);
				TracerManager.init(this.root);

				Gui.addSlider(SCALE_CTRL_ID, function(val){
					val = val < 1 ? 1 : val;
					//console.log(val);
					//val = Math.pow(val, 1.5);
					_.each(this.bodies3d, function(body3d){
						body3d.setScale(val);
					});
					this.draw();
				}.bind(this));

			},

			drawAxis : function(){
				var object = new THREE.AxisHelper(this.stageSize/10);
	         	object.position.x = 0;//r
	         	object.position.y = 0;//g
	         	object.position.z = 0;//b
		      	this.root.add( object );
			},

			setDimension : function(largestSMA, smallestSMA, largestRadius) {
				this.width = $(window).width();
				this.height = $(window).height();
				this.stageSize = largestSMA * ns.SCALE_3D;
				this.smallestSMA = smallestSMA;
			},

			toXYCoords:function (pos) {
		        var vector = projector.projectVector(pos, CameraManager.getCamera());
		        vector.x = (vector.x + 1)/2 * this.width;
		        vector.y = -(vector.y - 1)/2 * this.height;/**/
		        return vector;
			},

			draw : function(){
				//move sun, if its not a body shown. This assumes that the central body, if it has an orbit, revolves around the sun
				if(this.sun && this.centralBody && this.centralBody.orbit){
					var pos = this.centralBody.calculatePosition(ns.U.currentTime);
					pos.setLength(this.stageSize * 5).negate();
					this.sun.position.copy(pos);
				}

				_.each(this.bodies3d, function(b){
					b.drawMove();
				}.bind(this));

				this.renderer.render(this.root, CameraManager.getCamera());

				//after all bodies have been positionned, update camera matrix (as camera might be attached to a body)
				CameraManager.updateCameraMatrix();
				_.each(this.bodies3d, function(b){
					b.placeLabel(this.toXYCoords(b.getPosition()), this.width, this.height);
				}.bind(this));

				stats.update();
			},

			updateCamera : function(isPlaying){

				CameraManager.updateCamera(isPlaying);
			},


			addBody : function(celestialBody) {
				var body3d = Object.create(Body3D);

				body3d.init(celestialBody);
				this.bodies3d.push(body3d);
				body3d.setParentDisplayObject(this.root);
				CameraManager.addBody(body3d);
				TracerManager.addBody(body3d);
				
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
				console.log(maxScaleVal);
			},

			kill : function(){
				CameraManager.kill();
				TracerManager.kill();
				Gui.remove(SCALE_CTRL_ID);
				_.each(this.bodies3d, function(body3d){
					body3d.kill();
				});
				this.container.remove();

			}
		};

	}
);