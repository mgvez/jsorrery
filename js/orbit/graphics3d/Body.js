

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'three'
	], 
	function(ns, $, Tracer) {

		var Body = {

			init : function(celestialBody) {
				this.celestial = celestialBody;
				this.setPlanet();
				if(!this.celestial.isCentral) this.setTracer();
				this.setEventsListeners();


				//this.label = $('<div class="planetLabel">'+this.celestial.name+'</div>').appendTo('body');
			},

			placeLabel : function(pos){
				if(pos.z < 1){
					this.label.css({'left':pos.x+'px', 'top':pos.y+'px'}).show();
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

			spotPos : function(pos){
				var pxPos = this.getPixelCoords(pos);
				this.tracer && this.tracer.spotPos(pxPos.x, pxPos.y);
			},

			getPlanet : function() {
				return this.planet;
			},
			getTracer : function() {
				return this.tracer && this.tracer.getDisplayObject();
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

				var radius = (this.celestial.radius * ns.KM) / this.nmPerPix;
				var precision = Math.round(this.pxRadius);
				precision = precision < 40 ? 40 : (precision > 100 ? 100 : precision);
				var segments = precision;
				var rings = precision;
				var sphere = new THREE.Mesh(
					new THREE.SphereGeometry(radius, segments, rings),
					mat
				);

				this.planet = new THREE.Object3D();
				this.planet.add(sphere);

				if(this.celestial.ring){
					var ringSize = [
						((this.celestial.ring.innerRadius * ns.KM) / this.nmPerPix),
						((this.celestial.ring.outerRadius * ns.KM) / this.nmPerPix)
					];
					console.log(ringSize, radius);

					var ringMap = THREE.ImageUtils.loadTexture( this.celestial.ring.map );
					//ringMap.wrapS = ringMap.wrapT = THREE.RepeatWrapping;
					ringMap.anisotropy = 16;

					var ringGeometry = new THREE.RingGeometry( ringSize[0], ringSize[1], 40 );
					var ringMaterial = new THREE.MeshLambertMaterial( {
						map : ringMap,
						side: THREE.DoubleSide 
					});
					var ring = new THREE.Mesh( ringGeometry, ringMaterial );
					ring.position.set( 0, 0, 0 );
					ring.rotation.x = - Math.PI / 2;
					this.planet.add(ring);
					ring.rotation.x = Math.PI / 3;
				}
				
				var tilt = Math.PI / 2;
				if(this.celestial.tilt) tilt -= this.celestial.tilt * ns.DEG_TO_RAD;
				this.planet.rotation.x = tilt;

				/*
				this.planet.castShadow = true;
				this.planet.receiveShadow = true;
				/**/
				return this.planet;
			},

			setTracer : function() {
				this.tracer = Object.create(Tracer);
				this.tracer.init(this.celestial.color, this.celestial.nVertices, this.celestial.name);
				this.tracer.initPos(this.getPixelCoords());
				return this.tracer;
			},

			//ajoute une reference à l'objet relativement duquel on trace
			setTraceFrom : function(centralBody){
				this.tracer && this.tracer.setTraceFrom(centralBody);
			},
			
			drawMove : function(){
				var pxPos = this.getPixelCoords();
				this.planet.position = pxPos.clone();

				if(this.celestial.sideralDay){
					var curRotation = (ns.U.epochTime / this.celestial.sideralDay) * ns.CIRCLE;
					this.planet.rotation.y = (this.celestial.originalMapRotation || 0) + curRotation;
				}
				//console.dir(pxPos);
				//console.log(this.planet.position.x, this.planet.position.y, this.planet.position.z);
				this.tracer && this.tracer.doTrace(pxPos.clone());
			},

			getPixelCoords : function(pos) {
				var pxPosition = (pos || this.celestial.position).clone();
				pxPosition.multiplyScalar(1 / this.nmPerPix);//get position relative to the stage
				return pxPosition;
			}
		};

		return Body;

	});
