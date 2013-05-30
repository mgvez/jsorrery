

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
				//this.isLog = true;
				this.createLogger();
				this.velocity =  this.calculateVelocity(ns.TimeEpoch);
				this.afterMove();
			},
			
			createLogger : function() {
				if(this.isLog) {
					this.logger = $('<div style="border:'+this.color+' 1px solid;color:'+this.color+'" class="planetLogger">').appendTo('#logger');
				}
			},

			log:function(tx){
				this.logger && this.logger.html(tx);
			},

			afterMove : function() {
				var year = Math.floor(ns.curTime/this.period);
				if(year && year !== this.year){
					this.events.notify(['year']);
				}
				this.year = year;

				this.displayFromElements();
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
			},

			addVX : function(val){
				this.velocity.x += val;
			},

			addVY :  function(val){
				this.velocity.y += val;
			},
			addToMass : function(val){
				this.mass += val;
			}
		};

		$.extend(CelestialBody, Verlet);
		$.extend(CelestialBody, OrbitalElements);
		return CelestialBody;

	});
