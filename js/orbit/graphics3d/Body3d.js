

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/OrbitLine',
		'three'
	], 
	function(ns, $, OrbitLine) {

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
				
				//this.label = $('<div class="planetLabel">'+this.celestial.name+'</div>').appendTo('body');
			},

			placeLabel : function(pos){
				if(pos.z < 1){
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
				this.planet.scale.set(scaleVal, scaleVal, scaleVal);
			},

			getPlanetSize : function(){
				return this.celestial.radius * ns.KM * ns.SCALE_3D ;
			},

			getPlanetStageSize : function(){
				return this.getPlanetSize() * this.planet.scale.x;
			},

			setOrbitLines : function(){
				var orbitVertices = this.celestial.getOrbitVertices();
				
				if(orbitVertices){
					this.orbitLine = Object.create(OrbitLine);
					this.orbitLine.init(this.celestial.name, this.celestial.color, orbitVertices);
					//does this body revolves around the system's main body? If so, draw its ecliptic
					if(!this.celestial.relativeTo || this.celestial.relativeTo == ns.U.getBody().name){
						var eclipticVertices = this.celestial.getOrbitVertices();
						eclipticVertices = _.map(eclipticVertices, function(val){ return val.negate();});
						this.eclipticLine =  Object.create(OrbitLine);
						this.eclipticLine.init(this.celestial.name, ns.U.getBody().color, eclipticVertices);
					}
				}
			},

			showEcliptic : function(){
				this.eclipticLine && this.root.add(this.eclipticLine.getDisplayObject());
			},

			hideEcliptic : function(){
				this.eclipticLine && this.root.remove(this.eclipticLine.getDisplayObject());
			},

			showOrbit : function(){
				if(!this.orbitLine) return;
				this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
			},

			hideOrbit : function(){
				if(!this.orbitLine) return;
				this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
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
			},

			getPosition : function(pos) {
				var curPosition = (pos && pos.clone()) || this.celestial.getPosition();
				return curPosition.multiplyScalar(ns.SCALE_3D);
			},

			getName : function(){
				return this.celestial.name;
			}
		};

		return Body3d;

	});
