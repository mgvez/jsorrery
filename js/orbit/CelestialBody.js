

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/algorithm/Verlet',
		'orbit/algorithm/OrbitalElements',
		'three'
	], 
	function(ns, $, Verlet, OrbitalElements) {

		var CelestialBody = {

			init : function(display) {

				this.display = display;
				this.force = new THREE.Vector3();
				this.movement = new THREE.Vector3();

				this.orbitalElements = Object.create(OrbitalElements);
				this.orbitalElements.setDefaultOrbit(this.orbit, this.orbitCalculator);

				var elements = this.orbitalElements.calculateElements(ns.startEpochTime);
				this.period = this.orbitalElements.calculatePeriod(elements, this.relativeTo);
				this.position = this.isCentral ? new THREE.Vector3() : this.orbitalElements.getPositionFromElements(elements);
				this.relativePosition = new THREE.Vector3();
				this.velocity = this.isCentral ? new THREE.Vector3() : this.orbitalElements.calculateVelocity(ns.startEpochTime, this.relativeTo, this.isPerturbedOrbit);


				this.angle = 0;
				this.totalDist = 0;
				//this.isLog = true;
				//this.createLogger();

				this.verlet = Object.create(Verlet);
				this.verlet.setBody(this);

				//console.log(this.name, this.position, this.velocity);

			},

			afterInitialized : function(){
				if(this.relativeTo) {
					var central = ns.U.getBody(this.relativeTo);
					if(central && central!==ns.U.getBody()) {
						this.position.add(central.position);
						this.velocity.add(central.velocity);
					}
				}
				this.previousPosition = this.position.clone();
				this.originalPosition = this.position.clone();
				this.afterMove(0);

				if(this.customInitialize) this.customInitialize();
			},

			moveBody : function(deltaTIncrement, i){
				this.verlet.moveBody(deltaTIncrement, i);
			},

			//calculate the number of vertices it takes to have a trace that makes one orbit, with the configured distance between each vertex
			calculateTraceParams : function(universeSize) {

				var defaultVertexDist = this.vertexDist = universeSize * ns.vertexDist;
				this.nVertices = ns.minVertexPerOrbit;

				if(this.orbit){

					//cirumference of orbit
					var a = this.orbit.base.a;
					var e = this.orbit.base.e;
					var b = a * Math.sqrt(1-Math.pow(e, 2));
					this.circ = (2 * Math.PI) * Math.sqrt(
							(
							Math.pow(a, 2)+Math.pow(b, 2)
							)/2
						) * ns.KM;
					
					var thisMinVertexDist = this.circ / ns.minVertexPerOrbit;
					if(defaultVertexDist > thisMinVertexDist){
						this.vertexDist = thisMinVertexDist;
					}

					this.nVertices = Math.round((this.circ / this.vertexDist));
					this.vertexDist = this.circ / this.nVertices;
					this.nVertices++;
				}
				//console.log(this.name, this.nVertices, this.vertexDist);
				
			},

			/**
			Calculates orbit line from orbital elements. By default, the orbital elements might not be osculating, i.e. they might account for perturbations. But the given orbit would thus be different slightly from the planet's path, as the velocity is calculated by considering that the orbit is elliptic.
			*/
			getOrbitVertices : function(isElliptic){
				if(!this.period) return;
				
				var startTime = ns.startEpochTime + ns.U.epochTime;

				var incr = this.period / 360;
				var points = [];
				var lastPoint;
				var point;
				var j;
				var angle;
				var step;
				var total = 0;
				var defaultOrbitalElements;

				//if we want an elliptic orbit from the current planet's position (i.e. the ellipse from which the velocity was computed with vis-viva), setup fake orbital elements from the position
				if(isElliptic) {
					defaultOrbitalElements = {
						base : this.orbitalElements.calculateElements(startTime, null, true)
					};
					defaultOrbitalElements.day = {M : 1};
					defaultOrbitalElements.base.a /= 1000;
					defaultOrbitalElements.base.i /= ns.DEG_TO_RAD;
					defaultOrbitalElements.base.o /= ns.DEG_TO_RAD;
					defaultOrbitalElements.base.w /= ns.DEG_TO_RAD;
					defaultOrbitalElements.base.M /= ns.DEG_TO_RAD;
					incr = ns.DAY;
					startTime = 0;
				}
				var computed;
				

				for(var i=0; total < 360; i++){
					computed = this.orbitalElements.calculateElements(startTime+(incr*i), defaultOrbitalElements);
					point = this.orbitalElements.getPositionFromElements(computed);
					if(lastPoint) {
						angle = point.angleTo(lastPoint) * ns.RAD_TO_DEG;
						if(angle > 1.3){
							for(j=0; j < angle; j++){
								step = (incr*(i-1)) + ((incr / angle) * j);
								computed = this.orbitalElements.calculateElements(startTime + step, defaultOrbitalElements);
								point = this.orbitalElements.getPositionFromElements(computed);
								points.push(point);
							}
							total += point.angleTo(lastPoint) * ns.RAD_TO_DEG;
							lastPoint = point;
							continue;
						}
						total += angle;					
					}
					points.push(point);
					lastPoint = point;
				}
				return points;
			},
			
			/*
			createLogger : function() {
				if(this.isLog) {
					this.logger = $('<div style="border:'+this.color+' 1px solid;color:'+this.color+'" class="planetLogger">').appendTo('#logger');
				}
			},

			log:function(tx){
				this.logger && this.logger.html(tx);
			},
			/**/
			afterTick : function() {
				var relativeToPos = ns.U.getBody(this.relativeTo).getPosition();
				this.relativePosition.copy(this.position).sub(relativeToPos);
				this.movement.copy(this.relativePosition).sub(this.previousPosition);

				//distance 
				this.totalDist += this.movement.length();
				this.angle += this.relativePosition.angleTo(this.previousPosition);
				this.previousPosition.copy(this.relativePosition);

				if(this.totalDist > this.vertexDist) {
					this.dispatchEvent( {type:'vertex'} );
					this.totalDist = this.totalDist % this.vertexDist;
				}

				if(this.angle > ns.CIRCLE){
					this.angle = this.angle % ns.CIRCLE;
					this.dispatchEvent( {type:'revolution'} );
				}

			},

			afterMove : function(time){
			},

			displayFromElements : function(){
				if(this.year == 0 && ns.U.epochTime && this.orbit) {

					if (this.displayElementsDelay === undefined) {
						var periodTracing = this.period - (this.period % ns.U.epochTime);
						var nTicksPerRev = Math.abs((periodTracing / ns.U.epochTime));
						var nDisplayPerRev = (this.orbit.base.a / ns.AU) *  10;
						nDisplayPerRev = nDisplayPerRev < 10 ? 10 : nDisplayPerRev;
						var nTicksPerDisplay = Math.ceil(nTicksPerRev / nDisplayPerRev);
						this.displayElementsDelay = nTicksPerDisplay * ns.U.epochTime;
					}

					if ((ns.U.epochTime % this.displayElementsDelay) == 0) {
						var computed = this.orbitalElements.calculateElements(ns.startEpochTime + ns.U.epochTime );
						var pos =  this.orbitalElements.getPositionFromElements(computed);
						this.dispatchEvent( {type:'spot', pos:pos} );
					}

				} 
			},

			calculatePosition : function(t) {
				return this.orbitalElements.calculatePosition(t);
			},

			getPosition : function(){
				return this.position.clone();
			}
		};

		CelestialBody = $.extend(Object.create( THREE.EventDispatcher.prototype ), CelestialBody);
		return CelestialBody;

	});
