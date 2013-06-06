
define(
	[
		'orbit/NameSpace',
		'jquery',
		'_',
		'orbit/graphics3d/Body',
		'three/controls/OrbitControls'
	], 
	function(ns, $, _, BodyGraphics){

		var projector;
		var defaultCameraFov = 50;

		return {
			createStage : function() {

				projector = projector || new THREE.Projector();
				this.bodies = {};
				this.rendrables = [];

				this.container = $('<div id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');

				this.renderer = new THREE.WebGLRenderer({antialias: true});
				this.renderer.shadowMapEnabled = true;
				this.camera = new THREE.PerspectiveCamera(defaultCameraFov, this.width / this.height, 0.1, 10000);

				this.scene = new THREE.Scene();

				this.scene.add(this.camera);


				this.camera.up = new THREE.Vector3(0,0,1);
				this.camera.position.z = this.height*0.9;
				this.camera.position.y = -this.height*0.9;
				this.camera.position.x = 100;
				this.camera.lookAt(new THREE.Vector3(0,0,0));

				this.renderer.setSize(this.width, this.height);
				this.controls = new THREE.OrbitControls(this.camera);/**/

				var ambiance = new THREE.DirectionalLight(0xFFffff, 0.1);
				ambiance.position.x = 0 * this.height;
				ambiance.position.y = 5 * this.width;
				ambiance.position.z = 5 * this.width;

				/*var sun = new THREE.DirectionalLight(0xFFFFFF, 1);
				sun.castShadow = true;
				sun.position.x = 5 * this.width;
				sun.position.y = -5 * this.width;
				sun.position.z = 0 * this.width;/**/
				//console.log(ambiance.position);

				var sun = new THREE.PointLight(0xFFFFFF);
				sun.position.x = 0;
				sun.position.y = 0;
				sun.position.z = 0;/**/

				this.scene.add(sun);
				this.scene.add(ambiance);

				/*var light = new THREE.AmbientLight( 0x404040 ); // soft white light
				this.scene.add( light );/***/

				//this.drawAxis();

				this.container.append(this.renderer.domElement);

			},

			toggleCamera : function(){

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
				
				/*/**/
				
				//

				$.each(this.rendrables, function(n, b){
					b.drawMove();
					/*var labelPos = this.toXYCoords(b.getPlanet().position.clone());
					if(labelPos.x>0 && labelPos.x<this.width && labelPos.y>0 && labelPos.y<this.height) {
						b.placeLabel(labelPos);
					}/**/
				}.bind(this));
				/*
				var coords = this.bodies.earth.getPlanet().position;
				this.camera.position.copy(coords);
				//var look = coords.clone().multiplyScalar(2);
				var look = new THREE.Vector3(-1000, 0, 0);
				this.camera.lookAt(look);
				/**/
				//this.camera.lookAt(this.bodies.mars.getPlanet().position);

				//this.camera.updateMatrixWorld();
				
				this.controls && this.controls.update();
				this.camera.updateProjectionMatrix();

				this.renderer.render(this.scene, this.camera);
				if(this.playing) setTimeout(this.draw.bind(this), 30);
			},


			addBody : function(celestialBody) {
				var graphics = Object.create(BodyGraphics);

				var pxRadius = celestialBody.radius / this.radiusKmPerPix;
				pxRadius = pxRadius < ns.smallestBodyMinimalSize ? ns.smallestBodyMinimalSize : pxRadius;
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
			}
		};

	}
);