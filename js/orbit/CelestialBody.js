

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

			init : function() {
				//console.log('*********'+this.name+'*************');

				this.root = new createjs.Container();
				

				this.force = new THREE.Vector3(0, 0, 0);
				this.pixelPosition = new THREE.Vector3(0, 0, 0);
				this.position = this.calculatePosition(ns.TimeEpoch);
				
				this.year = 0;

				this.perihelion = this.aphelion = 0;

				//this.isLog = true;
				this.createLogger();


				this.setPlanet();
				this.setTracer();

				this.debug();

				this.velocity =  this.calculateVelocity(ns.TimeEpoch);
				this.afterMove();
			},

			getDisplayObject : function() {

				this.drawMove();
				return this.root;

			},
			
			createLogger : function() {
				if(this.isLog) {
					this.logger = $('<div style="border:'+this.color+' 1px solid;color:'+this.color+'" class="planetLogger">').appendTo('#logger');
				}
			},

			afterMove : function() {
				var angle = Math.abs(Math.atan2(this.position.y, this.position.x));
				//this.logger && this.logger.html(angle);
				if (!this.originalAngle) {
					this.originalAngle = this.previousAngle = angle;
					return;
				}

				if(this.previousAngle && angle >= this.originalAngle && this.previousAngle < this.originalAngle) {

					//keep first orbit trace, but delete others
					this.tracer.getNew(this.year == 0);
					this.year++;
				}

				if(this.isLog && !this.logged && this.previousPosition){
					var instVel = this.position.clone();
					instVel.sub(this.previousPosition);
					instVel.multiplyScalar(1000 / (3600*24*7));
					//this.logger.html(this.velocity.length()+'<br>'+instVel.length());
					this.logged = true;
				}
				this.previousAngle = angle;
				
			},

			setPlanet : function(){
				this.planet = this.planet || new createjs.Shape();
				this.planet.graphics.clear();
				this.planet.graphics.beginFill(this.color).drawCircle(0, 0, this.pxRadius || 1);
				this.root.addChild(this.planet);
				return this.planet;
			},

			setTracer : function() {
				this.tracer = Object.create(Tracer);
				this.tracer.init(this.color);
				this.setPixelCoords();
				this.tracer.initPos(this.pixelPosition.x, this.pixelPosition[ns.axisToShowInY]);
				this.root.addChild(this.tracer.getDisplayObject());
				return this.tracer;
			},

			addToMass : function(val){
				this.mass += val;
			},

			//ajoute une reference à l'objet relativement duquel on trace
			setTraceFrom : function(centralBody){
				this.tracer.setTraceFrom(centralBody);
			},
			
			drawMove : function(tracing){
				this.setPixelCoords();
				this.planet.x = this.pixelPosition.x;				
				this.planet.y = this.pixelPosition[ns.axisToShowInY];	
				this.tracer.doTrace(this.pixelPosition.x, this.pixelPosition[ns.axisToShowInY]);
				this.displayFromElements();
			},

			displayFromElements : function(){
				if((this.name == 'halley' || this.year == 0) && ns.curTime && !this.isCentral) {

					if (this.displayElementsDelay === undefined) {
						//console.log(this.name, this.period);
						var periodSeconds = (this.period * ns.day) ;
						var periodTracing = periodSeconds - (periodSeconds % ns.curTime);
						var nTicksPerRev = Math.abs((periodTracing / ns.curTime));
						var nTicksPerDisplay = Math.ceil(nTicksPerRev / 20);
						//console.log(this.name, nTicksPerRev);
						this.displayElementsDelay = nTicksPerDisplay * ns.curTime;
						//console.log(this.displayElementsDelay);
						//if(this.name == 'halley') this.displayElementsDelay = 5 * ns.curTime;
					}

					if ((ns.curTime % this.displayElementsDelay) == 0) {

						var computed = this.calculateElements(ns.TimeEpoch + ns.U.curTime );
						var pos =  this.getPositionFromElements(computed);
						this.tracer.spotPos(pos.x / ns.nmPerPix, pos[ns.axisToShowInY] / ns.nmPerPix);

						var dsp = this.prevAnomaly ? computed.v - this.prevAnomaly : computed.v;

						//this.logger && this.logger.html(dsp);
						this.prevAnomaly = computed.v;

						this.calculateVelocity(ns.TimeEpoch + ns.U.curTime);
					}

					/*var degAngle = angle * 180 / Math.PI;
					this.debugged = this.debugged || [];
					var angleDiff = Math.abs(degAngle - this.debugged[this.debugged.length-1]);
					if (this.debugged.length == 0 || angleDiff > 5){
						this.debugged.push(degAngle);
						var pos = this.calculatePosition(ns.TimeEpoch + ns.U.curTime );
						this.tracer.spotPos(pos.x / ns.nmPerPix, pos.y / ns.nmPerPix);
					}/**/

				} 
			},

			setPixelCoords : function() {
				this.pixelPosition.x = this.position.x / ns.nmPerPix;//get position relative to the stage
				this.pixelPosition.y = this.position.y / ns.nmPerPix;
				this.pixelPosition.z = this.position.z / ns.nmPerPix;
			},

			addVX : function(val){
				this.velocity.x += val;
			},

			addVY :  function(val){
				this.velocity.y += val;
			}
		};

		$.extend(CelestialBody, Verlet);
		$.extend(CelestialBody, OrbitalElements);
		return CelestialBody;

	});
