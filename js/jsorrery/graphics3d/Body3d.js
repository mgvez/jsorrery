

define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/Dimensions',
		'jsorrery/graphics2d/Labels',
		'jsorrery/graphics3d/loaders/ResourceLoader',
		'three',
		'three/RingGeometry2',
		'vendor/greensock/TweenMax',
		'vendor/greensock/easing/EasePack'
	], 
	function(ns, $, Dimensions, Labels, ResourceLoader) {
		'use strict';

		var Body3d = {

			init : function(celestialBody) {
				this.root = new THREE.Object3D();
				this.celestial = celestialBody;
				//max delta T to show rotation. If deltaT is larger than that, planet would spin too fast, so don't show sideral day
				this.maxDeltaForSideralDay = this.celestial.sideralDay && this.celestial.sideralDay / 20;

				this.setPlanet();

				//make this display object available from the celestial body
				this.celestial.getBody3D = function(){
					return this;
				}.bind(this);

				Labels.addPlanetLabel(this.celestial.title || this.celestial.name, this);

			},

			addEventLabel:function(){},

			getDisplayObject : function() {
				return this.root;
			},

			setParentDisplayObject : function(object3d) {
				this.parentContainer = object3d;
				this.parentContainer.add(this.root);
			},

			setPlanet : function(){
				var map = this.celestial.map;
				var matOptions = {};
				if(map){
					matOptions.map = ResourceLoader.loadTexture(map);
				} else {
					matOptions.color = this.celestial.color
				}

				var mat = new THREE.MeshPhongMaterial(matOptions);
				_.extend(mat, this.celestial.material || {});

				var radius = this.getPlanetSize();
				var segments = 50;
				var rings = 50;
				var sphere = new THREE.Mesh(
					new THREE.SphereGeometry(radius, segments, rings),
					mat
				);

				//console.log(this.celestial.name+' size ',radius, ' m');

				this.planet = new THREE.Object3D();
				this.planet.add(sphere);

				if(this.celestial.ring){
					var ringSize = [
						Dimensions.getScaled(this.celestial.ring.innerRadius * ns.KM),
						Dimensions.getScaled(this.celestial.ring.outerRadius * ns.KM)
					];
					
					var ringMap = ResourceLoader.loadTexture( this.celestial.ring.map );

					var ringMaterial = new THREE.MeshLambertMaterial({
						map: ringMap,
						transparent: true,
						side: THREE.DoubleSide
					});

					//var ringGeometry = new THREE.TorusGeometry(ringSize[1], ringSize[1] - ringSize[0], 2, 40);
					var ringGeometry = new THREE.RingGeometry2(ringSize[1], ringSize[0], 180, 1, 0, Math.PI * 2);
					ringGeometry.computeFaceNormals();

					var ring = new THREE.Mesh(ringGeometry, ringMaterial);
					ring.rotation.x = - Math.PI / 2;
					this.planet.add(ring);
					
				}
				
				var tilt = Math.PI / 2;
				if(this.celestial.tilt) tilt -= this.celestial.tilt * ns.DEG_TO_RAD;
				this.planet.rotation.x = tilt;				

				this.root.add(this.planet);
				return this.planet;
			},

			setScale : function(scaleVal) {
				if(this.maxScale && this.maxScale < scaleVal) return;
				this.planet.scale.set(scaleVal, scaleVal, scaleVal);
			},

			getPlanetSize : function(){
				return Dimensions.getScaled(this.celestial.radius * ns.KM);
			},

			getPlanetStageSize : function(){
				return this.getPlanetSize() * this.planet.scale.x;
			},

			addCamera : function(name, camera){
				this.root.add(camera);
				this.cameras = this.cameras || {};
				this.cameras[name] = camera;
			},

			getCamera : function(name){
				return this.cameras && this.cameras[name];
			},
			
			drawMove : function(){
				var pos = this.getPosition();
				this.root.position.copy(pos);
				if(this.celestial.sideralDay && ns.U.deltaT <= this.maxDeltaForSideralDay){
					var curRotation = (ns.U.epochTime / this.celestial.sideralDay) * ns.CIRCLE;
					this.planet.rotation.y = (this.celestial.baseMapRotation || 0) + curRotation;
				}
				this.tracer && this.tracer.doTrace(pos);
				return pos;
			},

			getScreenSizeRatio : function(camPos, fov){
				var sz = this.getPlanetStageSize();
				//console.log(this.planet.scale.x);
				var dist = this.getPosition().sub(camPos).length();

				var height = 2 * Math.tan( (fov * ns.DEG_TO_RAD) / 2 ) * dist; // visible height, see http://stackoverflow.com/questions/13350875/three-js-width-of-view/13351534#13351534
				return sz/height;
			},

			getPosition : function(pos) {
				var curPosition = (pos && pos.clone()) || this.celestial.getPosition();
				return Dimensions.getScaled(curPosition);
			},

			getName : function(){
				return this.celestial.name;
			}
		};

		return Body3d;

	});
