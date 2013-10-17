

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Dimensions',
		'orbit/graphics3d/loaders/ResourceLoader',
		'three',
		'vendor/greensock/TweenMax',
		'vendor/greensock/easing/EasePack'
	], 
	function(ns, $, Dimensions, ResourceLoader) {
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

				this.label = $('<div class="planetSpot" data-shown="true"><div class="planetLabel">'+(this.celestial.title || this.celestial.name)+'</div></div>').appendTo('body');
			},

			placeLabel : function(pos, w, h, camPos, fov){
				if(pos.z<1 && pos.z>0 && pos.x>0 && pos.x<w && pos.y>0 && pos.y<h){
					this.label.css({left : pos.x+'px', top : pos.y+'px'}).show();

					var dist = this.root.position.distanceTo(camPos);
					var visibleHeight = 2 * Math.tan( fov / 2 ) * dist;

					var isVisible = (this.getPlanetStageSize() / visibleHeight) < 0.1;
					if(
						(!isVisible && this.label.data('shown')===true)
						||
						(isVisible && this.label.data('shown')===false)
					) {
						this.label.data('shown', !this.label.data('shown'));
						TweenMax.killTweensOf(this.label);
						TweenMax.to(this.label, 1, {css:{opacity: isVisible ? 1 : 0}});
					}

				} else {
					this.label.hide();
				}
			},

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

				if(this.celestial.bumpmap){
					var bumpMap = ResourceLoader.loadTexture(this.celestial.bumpmap);
					bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
					bumpMap.format = THREE.RGBFormat;

					matOptions.bumpMap = bumpMap;
					matOptions.bumpScale = 0.01;/**/
				}

				var mat = new THREE.MeshPhongMaterial(matOptions);

				if(this.celestial.name==='sun'){
					mat.emissive = new THREE.Color( 0xdddd33 );
				}

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
	                   map: ringMap
	                });
					var ringGeometry = new THREE.TorusGeometry(ringSize[1], ringSize[1] - ringSize[0], 2, 40);

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

			getPosition : function(pos) {
				var curPosition = (pos && pos.clone()) || this.celestial.getPosition();
				return Dimensions.getScaled(curPosition);
			},

			getName : function(){
				return this.celestial.name;
			},

			kill : function(){
				this.label.remove();
			}
		};

		return Body3d;

	});
