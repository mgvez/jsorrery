

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
				var elements = this.calculateElements(ns.startEpochTime);
				this.calculatePeriod(elements);
				this.position = this.isCentral ? new THREE.Vector3() : this.getPositionFromElements(elements);
				this.velocity = this.isCentral ? new THREE.Vector3() : this.calculateVelocity(ns.startEpochTime);
				//console.log(this.name+' dist from center ',this.position.length(), ' m');

				if(this.relativeTo) {
					var central = ns.U.getBody(this.relativeTo);
					if(central && central!==ns.U.getBody()) {
						this.position.add(central.position);
						this.velocity.add(central.velocity);
					}
				}

				this.previousPosition = this.position.clone();
				this.originalPosition = this.position.clone();

				this.angle = 0;
				this.totalDist = 0;
				//this.isLog = true;
				this.createLogger();

				this.verlet = Object.create(Verlet);
				this.verlet.setBody(this);

				this.afterMove(0);
				//console.log(this.name, this.position, this.velocity);

			},

			moveBody : function(deltaTIncrement, i){
				this.verlet.moveBody(deltaTIncrement, i);
			},

			afterInitialized : function(){

			},

			calculateTraceParams : function(universeSize, secondsPerTick) {

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

					this.nVertices = (this.circ / this.vertexDist) + 1;
				}

				
			},

			getOrbitPoints : function(){
				if(!this.period) return;
				var incr = this.period / 360;
				var points = [];
				var lastPoint;
				var point;
				var j;
				var angle;
				var step;
				var nmoins=0, nplus=0;
				for(var i=0; i <= 360; i++){
					point = this.calculatePosition(ns.startEpochTime+(incr*i));
					if(lastPoint) {
						angle = point.angleTo(lastPoint) * ns.RAD_TO_DEG;
						if(angle > 1.5){
							nplus++;
							for(j=0; j < angle; j++){
								step = (incr*(i-1)) + ((incr / angle) * j);
								point = this.calculatePosition(ns.startEpochTime+ step );
								points.push(point);
							}
							lastPoint = point;
							continue;
						} else if( angle < 1) {
							/*nmoins++;
							do{
								i++;
								point = this.calculatePosition(ns.startEpochTime+(incr*i));
								angle = point.angleTo(lastPoint) * ns.RAD_TO_DEG;
								
							} while (angle < 1);/**/
						}
						
					}
					points.push(point);
					lastPoint = point;
				}
				return points;
			},
			
			createLogger : function() {
				if(this.isLog) {
					this.logger = $('<div style="border:'+this.color+' 1px solid;color:'+this.color+'" class="planetLogger">').appendTo('#logger');
				}
			},

			log:function(tx){
				this.logger && this.logger.html(tx);
			},

			afterTick : function() {
				
				this.movement.copy(this.position).sub(this.previousPosition);

				//distance 
				this.totalDist += this.movement.length();
				this.previousPosition.copy(this.position);

				if(this.totalDist > this.vertexDist) {
					this.dispatchEvent( {type:'vertex'} );
					this.totalDist = this.totalDist % this.vertexDist;
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
						var computed = this.calculateElements(ns.startEpochTime + ns.U.epochTime );
						var pos =  this.getPositionFromElements(computed);
						this.dispatchEvent( {type:'spot', pos:pos} );
					}

				} 
			},

			getPosition : function(){
				return this.position;
			}
		};

		CelestialBody = $.extend(Object.create( THREE.EventDispatcher.prototype ), CelestialBody);
		$.extend(CelestialBody, OrbitalElements);
		return CelestialBody;

	});
