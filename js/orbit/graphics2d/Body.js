

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics2d/Tracer',
		'three'
	], 
	function(ns, $, Tracer) {

		var Body = {

			init : function(celestialBody) {
				this.celestial = celestialBody;
				this.setEventsListeners();
				this.root = new createjs.Container();
				this.setPlanet();
				this.setTracer();
			},

			setEventsListeners:function(){
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
				this.tracer.getNew(false);
			},

			spotPos : function(pos){
				var pxPos = this.getPixelCoords(pos);
				this.tracer.spotPos(pxPos.x, pxPos[ns.axisToShowInY]);
			},

			getRoot : function() {
				this.drawMove();
				return this.root;
			},

			setPlanet : function(){
				this.planet = this.planet || new createjs.Shape();
				this.planet.graphics.clear();
				this.planet.graphics.beginFill(this.celestial.color).drawCircle(0, 0, this.pxRadius || 1);
				this.root.addChild(this.planet);
				return this.planet;
			},

			setTracer : function() {
				this.tracer = Object.create(Tracer);
				this.tracer.init(this.celestial.color);
				var pxPos = this.getPixelCoords();
				this.tracer.initPos(pxPos.x, pxPos[ns.axisToShowInY]);
				this.root.addChild(this.tracer.getDisplayObject());
				return this.tracer;
			},

			//ajoute une reference à l'objet relativement duquel on trace
			setTraceFrom : function(centralBody){
				this.tracer.setTraceFrom(centralBody);
			},
			
			drawMove : function(){
				var pxPos = this.getPixelCoords();
				this.planet.x = pxPos.x;				
				this.planet.y = pxPos[ns.axisToShowInY];	
				this.tracer.doTrace(pxPos.x, pxPos[ns.axisToShowInY]);
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
						this.tracer.spotPos(pos.x / ns.nmPerPix, pos[ns.axisToShowInY] / ns.nmPerPix);

						var dsp = this.prevAnomaly ? computed.v - this.prevAnomaly : computed.v;

						//this.logger && this.logger.html(dsp);
						this.prevAnomaly = computed.v;

						this.calculateVelocity(ns.TimeEpoch + ns.U.curTime);
					}

				} 
			},

			getPixelCoords : function(pos) {
				var pxPosition = (pos || this.celestial.position).clone();
				pxPosition.x = pxPosition.x / this.nmPerPix;//get position relative to the stage
				pxPosition.y = pxPosition.y / this.nmPerPix;
				pxPosition.z = pxPosition.z / this.nmPerPix;
				return pxPosition;
			}
		};

		return Body;

	});
