

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
				this.setEventsListeners();
				this.setPlanet();
				if(!this.celestial.isCentral) this.setTracer();

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
				return;
				var d = this.celestial.getEvents();
				d.progress(function(args){
					var type = args.shift();
					switch(type){
						case 'year':
							this.resetTracer();
							break;
						case 'spot':
							this.spotPos(args.shift());
							break;
					}

				}.bind(this));
			},

			resetTracer : function(){
				this.tracer && this.tracer.getNew(false);
			},

			spotPos : function(pos){
				var pxPos = this.getPixelCoords(pos);
				this.tracer && this.tracer.spotPos(pxPos.x, pxPos[ns.axisToShowInY]);
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
					mat.emissive = new THREE.Color( 0x999933 );
				}

				//this.pxRadius = 25;
				var radius = this.pxRadius;
				var precision = Math.round(this.pxRadius);
				precision = precision < 10 ? 10 : (precision > 100 ? 100 : precision);
				var segments = precision;
				var rings = precision;
				this.planet = new THREE.Mesh(
					new THREE.SphereGeometry(radius, segments, rings),
					mat
				);
				
				this.planet.rotation.x = Math.PI / 2;

				/*
				this.planet.castShadow = true;
				this.planet.receiveShadow = true;
				/**/
				return this.planet;
			},

			setTracer : function() {
				this.tracer = Object.create(Tracer);
				this.tracer.init(this.celestial.color, this.celestial.period, this.celestial.name);
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

				if(this.celestial.sideralPeriod){
					var curRotation = ((ns.curTime / this.celestial.sideralPeriod) % 1) * Math.PI * 2;
					this.planet.rotation.y = curRotation;
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
