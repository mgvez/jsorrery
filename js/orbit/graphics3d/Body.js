

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'orbit/graphics3d/OrbitLine',
		'three'
	], 
	function(ns, $, Tracer, OrbitLine) {

		var Body = {

			init : function(celestialBody) {
				this.root = new THREE.Object3D();
				this.celestial = celestialBody;

				if(!this.celestial.isCentral) this.setTracer();
				this.setPlanet();
				this.setOrbitLines();
				this.setEventsListeners();
				
				//this.label = $('<div class="planetLabel">'+this.celestial.name+'</div>').appendTo('body');
			},

			placeLabel : function(pos){
				if(pos.z < 1){
					this.label.css({left : pos.x+'px', top : pos.y+'px'}).show();
				} else {
					this.label.hide();
				}
			},

			setEventsListeners:function(){
				this.celestial.addEventListener('spot', this.spotPos.bind(this));
				this.tracer && this.celestial.addEventListener('vertex', this.tracer.changeVertex.bind(this.tracer));
			},

			addTracerEventsListeners : function(body){
				if(!this.tracer) return;
				this.supplementalTracer = [body, this.tracer.changeVertex.bind(this.tracer)];
				this.supplementalTracer[0].addEventListener('vertex', this.supplementalTracer[1]);
			},

			removeTracerEventsListeners : function(){
				if(!this.supplementalTracer) return;
				this.supplementalTracer[0].removeEventListener('vertex', this.supplementalTracer[1]);
				this.supplementalTracer = null;
			},

			resetTracer : function(){
				this.tracer && this.tracer.getNew(false);
			},

			getTracer : function() {
				return this.tracer && this.tracer.getDisplayObject();
			},

			setTracer : function() {
				this.tracer = Object.create(Tracer);
				this.tracer.init(this.celestial.color, this.celestial.nVertices, this.celestial.name);
				this.tracer.initPos(this.getPosition());
				return this.tracer;
			},

			//add a reference to the object from which we trace
			setTraceFrom : function(centralBody){
				this.tracer && this.tracer.setTraceFrom(centralBody);
			},


			attachTrace : function(){
				this.tracer && this.tracer.attachTrace();
			},

			detachTrace : function(){
				this.tracer && this.tracer.detachTrace();
			},

			spotPos : function(pos){
				var pxPos = this.getPosition(pos);
				this.tracer && this.tracer.spotPos(pxPos.x, pxPos.y);
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

				this.planet.scale.set(ns.SCALE_PLANETS, ns.SCALE_PLANETS, ns.SCALE_PLANETS);

				this.root.add(this.planet);
				return this.planet;
			},

			getPlanetSize : function(){
				return this.celestial.radius * ns.KM * ns.SCALE_3D ;
			},

			getPlanetStageSize : function(){
				return this.getPlanetSize() * ns.SCALE_PLANETS;
			},

			setOrbitLines : function(){
				var orbitVertices = this.celestial.getOrbitVertices();
				
				if(orbitVertices){
					this.orbitLine = Object.create(OrbitLine);
					this.orbitLine.init(this.celestial.name, this.celestial.color, orbitVertices);
					
					var eclipticVertices = this.celestial.getOrbitVertices();
					eclipticVertices = _.map(eclipticVertices, function(val){ return val.negate();});
					this.eclipticLine =  Object.create(OrbitLine);
					this.eclipticLine.init(this.celestial.name, ns.U.getBody().color, eclipticVertices);
				}
			},

			showEcliptic : function(){
				this.eclipticLine && this.root.add(this.eclipticLine.getDisplayObject());
			},

			hideEcliptic : function(){
				this.eclipticLine && this.root.remove(this.eclipticLine.getDisplayObject());
			},

			showOrbit : function(){
				this.orbitLine && this.parentContainer.add(this.orbitLine.getDisplayObject());
			},

			hideOrbit : function(){
				this.orbitLine && this.parentContainer.remove(this.orbitLine.getDisplayObject());
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

		return Body;

	});
