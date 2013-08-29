

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/OrbitLine',
		'three'
	], 
	function(ns, $, OrbitLine) {
		'use strict';
		
		var Body3d = {

			init : function(celestialBody) {
				this.root = new THREE.Object3D();
				this.celestial = celestialBody;

				this.setPlanet();
				this.setOrbitLines();

				//make this display object available from the celestial body
				this.celestial.getBody3D = function(){
					return this;
				}.bind(this);

				this.label = $('<div class="planetSpot"><div class="planetLabel">'+this.celestial.name+'</div></div>').appendTo('body');
			},

			placeLabel : function(pos, w, h){
				if(pos.z<1 && pos.z>0 && pos.x>0 && pos.x<w && pos.y>0 && pos.y<h){
					this.label.css({left : pos.x+'px', top : pos.y+'px'}).show();
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
					matOptions.map = THREE.ImageUtils.loadTexture(map);
				} else {
					matOptions.color = this.celestial.color
				}

				var mat = new THREE.MeshLambertMaterial(matOptions);

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
						this.celestial.ring.innerRadius * ns.KM * ns.SCALE_3D,
						this.celestial.ring.outerRadius * ns.KM * ns.SCALE_3D
					];
					
					var ringMap = THREE.ImageUtils.loadTexture( this.celestial.ring.map );
		
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
				return this.celestial.radius * ns.KM * ns.SCALE_3D ;
			},

			getPlanetStageSize : function(){
				return this.getPlanetSize() * this.planet.scale.x;
			},

			setOrbitLines : function(){

				var orbitVertices = this.celestial.getOrbitVertices(false);
				
				if(orbitVertices){
					//get orbit line calculated from precise locations instead of assumed ellipse
					if(!this.perturbedOrbitLine) {
						this.perturbedOrbitLine = Object.create(OrbitLine);
						this.perturbedOrbitLine.init(this.celestial.name, this.celestial.color);
					}
					this.perturbedOrbitLine.setLine(orbitVertices);

					//get new orbit vertices, but elliptical (not perturbed)
					orbitVertices = this.celestial.getOrbitVertices(true);

					//does this body revolves around the system's main body? If so, draw its ecliptic
					if(!this.celestial.relativeTo || this.celestial.relativeTo == ns.U.getBody().name){
						var eclipticVertices = _.clone(orbitVertices);
						eclipticVertices = _.map(eclipticVertices, function(val){ return val.clone().negate();});
						if(!this.eclipticLine) {
							this.eclipticLine = Object.create(OrbitLine);
							this.eclipticLine.init(this.celestial.name, ns.U.getBody().color);
						}
						this.eclipticLine.setLine(eclipticVertices);
					}/**/

					if(!this.ellipticOrbitLine) {
						this.ellipticOrbitLine = Object.create(OrbitLine);
						this.ellipticOrbitLine.init(this.celestial.name, this.celestial.color);
					}
					this.ellipticOrbitLine.setLine(orbitVertices);


					this.recalculateListener = function(){
						this.recalculateOrbitLine(false);
					}.bind(this);

					if(this.celestial.isPerturbedOrbit) {
						this.celestial.addEventListener('revolution', this.recalculateListener);
					}

					this.orbitLine = this.celestial.isPerturbedOrbit ? this.perturbedOrbitLine : this.ellipticOrbitLine;

				}
			},

			recalculateOrbitLine : function(isForced){
				if(!isForced && (!this.perturbedOrbitLine || !this.celestial.isPerturbedOrbit)) return;
				console.log('recalculate '+this.celestial.name+' perturbed:'+this.celestial.isPerturbedOrbit);
				var orbitVertices = this.celestial.getOrbitVertices(!this.celestial.isPerturbedOrbit);
				if(orbitVertices){
					var wasAdded = this.orbitLine.added;
					this.hideOrbit();
					this.orbitLine.setLine(orbitVertices);
					if(wasAdded){
						this.showOrbit();
					}
				}
			},

			showEcliptic : function(){
				if(!this.eclipticLine) return;
				this.eclipticLine.added = true;
				this.root.add(this.eclipticLine.getDisplayObject());
				
			},

			hideEcliptic : function(){
				if(!this.eclipticLine) return;
				this.eclipticLine.added = false;
				this.root.remove(this.eclipticLine.getDisplayObject());
			},

			showOrbit : function(){
				if(!this.orbitLine) return;
				this.orbitLine.added = true;
				this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
				
				//this.getOrbitContainer().add(this.ellipticOrbitLine.getDisplayObject());
			},

			hideOrbit : function(){
				if(!this.orbitLine) return;
				this.orbitLine.added = false;
				this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
				//this.getOrbitContainer().remove(this.ellipticOrbitLine.getDisplayObject());
			},

			//the orbit is drawn around the main body
			getOrbitContainer : function(){
				return ns.U.getBody(this.celestial.relativeTo).getBody3D().getDisplayObject();
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

				if(this.celestial.sideralDay){
					var curRotation = (ns.U.epochTime / this.celestial.sideralDay) * ns.CIRCLE;
					this.planet.rotation.y = (this.celestial.originalMapRotation || 0) + curRotation;
				}
				this.tracer && this.tracer.doTrace(pos);
				return pos;
			},

			getPosition : function(pos) {
				var curPosition = (pos && pos.clone()) || this.celestial.getPosition();
				return curPosition.multiplyScalar(ns.SCALE_3D);
			},

			getName : function(){
				return this.celestial.name;
			},

			kill : function(){
				this.label.remove();
				this.recalculateListener && this.celestial.removeEventListener('revolution', this.recalculateListener);
			}
		};

		return Body3d;

	});
