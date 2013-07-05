
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

		return {
			createStage : function(scenario) {

				projector = projector || new THREE.Projector();
				this.bodies3d = [];

				var container = $('<div id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
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

				stats = new Stats();
				$('body').append( stats.domElement );

				container.append(this.renderer.domElement);

				//this.drawAxis();
				CameraManager.init(this, this.width/this.height, scenario.fov, this.stageSize, container);
				TracerManager.init(this.root);

				Gui.addSlider(function(val){
					val = val < 1 ? 1 : val;
					var correctedVal = Math.pow(val, 1.5);
					_.each(this.bodies3d, function(body3d){
						body3d.setScale(correctedVal);
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

				//central body's scale is at most 80% of the nearest orbit
				if(celestialBody.isCentral) {
					body3d.maxScale = (this.smallestSMA / (celestialBody.radius*ns.KM)) * 0.8;
					body3d.maxScale = body3d.maxScale < 1 ? 1 : body3d.maxScale;
					//console.log(body3d.maxScale);
				}
				
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