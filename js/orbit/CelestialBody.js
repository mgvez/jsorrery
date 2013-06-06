

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/algorithm/Verlet',
		'orbit/algorithm/OrbitalElements',
		'orbit/graphics2d/Tracer',
		'three'
	], 
	function(ns, $, Verlet, OrbitalElements, Tracer) {

		var CelestialBody = {

			init : function(display) {
				this.events = $.Deferred();
				this.display = display;
				this.force = new THREE.Vector3(0, 0, 0);
				var elements = this.calculateElements(ns.TimeEpoch);
				this.calculatePeriod(elements);
				this.position = this.getPositionFromElements(elements);
				this.previousPosition = this.position.clone();
				this.angle = 0;
				this.isLog = true;
				this.createLogger();
				this.velocity =  this.calculateVelocity(ns.TimeEpoch);
				this.afterMove();

				this.verlet = Object.create(Verlet);
				this.verlet.setBody(this);

			},

			moveBody : function(deltaTIncrement){
				this.verlet.moveBody(deltaTIncrement);
			},

			calculateTracePeriod : function(universeSize, secondsPerTick) {
				this.log(this.period / secondsPerTick);
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
				return;
				if(this.orbit){
					this.angle += this.position.angleTo(this.previousPosition);
					this.previousPosition.copy(this.position);
					this.i++;
					this.log(this.i);
					if(this.angle > ns.CIRCLE){
						this.year++;
						this.angle = this.angle % ns.CIRCLE;
						this.events.notify(['year']);
					}
				}

				if(this.period){
					var year = Math.floor(Math.abs(ns.curTime/this.period));
					if(year && year !== this.year){
						
					}
					this.year = year;
				}
				this.displayFromElements();
			},

			afterMove : function(){

			},

			displayFromElements : function(){
				if(this.year == 0 && ns.curTime && this.orbit) {

					if (this.displayElementsDelay === undefined) {
						var periodTracing = this.period - (this.period % ns.curTime);
						var nTicksPerRev = Math.abs((periodTracing / ns.curTime));
						var nDisplayPerRev = (this.orbit.base.a / ns.AU) *  10;
						nDisplayPerRev = nDisplayPerRev < 10 ? 10 : nDisplayPerRev;
						var nTicksPerDisplay = Math.ceil(nTicksPerRev / nDisplayPerRev);
						this.displayElementsDelay = nTicksPerDisplay * ns.curTime;
					}

					if ((ns.curTime % this.displayElementsDelay) == 0) {
						var computed = this.calculateElements(ns.TimeEpoch + ns.U.curTime );
						var pos =  this.getPositionFromElements(computed);
						this.events.notify(['spot', pos]);
					}

				} 
			},

			getEvents : function(){
				return this.events.promise();
			}
		};

		//$.extend(CelestialBody, Verlet);
		$.extend(CelestialBody, OrbitalElements);
		return CelestialBody;

	});
