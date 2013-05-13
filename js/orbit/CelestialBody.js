

define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	], 
	function(ns, $) {

		
		return {

			init : function() {
				console.log('*********'+this.name+'*************');
				this.force = new THREE.Vector3(0, 0, 0);
				this.position = this.calculatePosition(ns.TimeEpoch);
				this.velocity =  this.calculateVelocity(ns.TimeEpoch);
				this.tracePosition = this.position.clone();
				
				this.isTracing = true;
				this.year = 0;

				this.perihelion = this.aphelion = 0;

				this.isLog = true;
				this.createLogger();
				this.afterMove();
			},

			getDisplayObject : function() {

				this.root = new createjs.Container();

				this.root.addChild(this.getPlanet());
				this.root.addChild(this.getTracer());

				return this.root;

			},
			
			createLogger : function() {
				if(this.isLog) {
					this.logger = $('<div style="background:'+this.color+'" class="planetLogger">').appendTo('#logger');
				}
			},

			afterMove : function() {
				if(this.name == 'sun') return;
				var angle = Math.atan2(this.position.y, this.position.x);
				//this.logger.html(angle);
				if (!this.originalAngle) {
					this.originalAngle = this.previousAngle = angle;
					return;
				}

				if(this.previousAngle && angle >= this.originalAngle && this.previousAngle < this.originalAngle) {
					this.year++;
					this.tracer.graphics.clear();

					this.tracer.graphics.setStrokeStyle(0.5);
					this.tracer.graphics.beginStroke(this.color);
				}
				this.previousAngle = angle;
				
				var dist = this.position.length();
				var d = false;
				if(!this.perihelion || dist < this.perihelion) {
					this.perihelion = dist;
					d = true;
				}	
				if(!this.aphelion || dist > this.aphelion) {
					this.aphelion = dist;
					d = true;
				}				

				if (this.isLog && d) {
					this.logger.html(this.name + ' :: p:'+this.perihelion+ ' a:' + this.aphelion);
					//this.logger.html(this.name + ' : ' + this.year);
				}
			},

			getPlanet : function(){
				this.planet = this.planet || new createjs.Shape();
				this.planet.graphics.clear();
				this.planet.graphics.beginFill(this.color).drawCircle(0, 0, this.pxRadius || 1);
				return this.planet;
			},

			getTracer : function() {

				this.tracer = this.tracer || new createjs.Shape();
				this.tracer.graphics.clear();
				this.tracer.graphics.setStrokeStyle(0.5);
				this.tracer.graphics.beginStroke(this.color);
				return this.tracer;
			},

			addToMass : function(val){
				this.mass += val;
			},

			//ajoute une reference à l'objet relativement duquel on trace
			addTraceFrom : function(ref){
				this.traceFrom = ref;
	            if(this.isTracing){
					this.tracePosition.x = this.x - this.traceFrom.x;
					this.tracePosition.y = this.y - this.traceFrom.y;
					this.tracer.graphics.moveTo(this.tracePosition.x, this.tracePosition.y);
				}
			},
			
			drawMove : function(tracing){
				this.x = this.position.x / this.nmPerPix;//get position relative to the stage
				this.y = this.position.y / this.nmPerPix;

				this.planet.x = this.x;				
				this.planet.y = this.y;	
				this.doTrace();
			},

			getDebug : function(c, deltaT) {
				if(!this.dg){
					this.dg = new createjs.Shape();
					this.dg.graphics.clear();
					this.dg.graphics.beginFill(this.color);
					c.addChild(this.dg)
				}

				if(this.year > 1) return;
				
				var curTE = TE + (deltaT / (60*60*24));

				var pos = this.calculatePosition(curTE);
				var x = pos.x /this.nmPerPix;
				var y = pos.y /this.nmPerPix;

				this.dg.graphics.drawCircle(x, y, 1);
				
				
				this.dg.x = 0;
				this.dg.y = 0;

				/*
				var i = 0;

				this.debugGraphics.graphics.setStrokeStyle(0.5);
				this.debugGraphics.graphics.beginStroke(this.color);
				
				var dbg = function(){

					var pos = _self.calculatePosition(TE+i);
					var x = pos.x /_self.nmPerPix;
					var y = pos.y /_self.nmPerPix;
					_self.debugGraphics.graphics.lineTo(x, y);
					ns.U.stage.update();
					if(i < 365) setTimeout(dbg, 50);
					i++;
				};
				
				dbg();/**/

				return this.debugGraphics;
			},



			doTrace : function(){
				if(this.isTracing){
					this.setTracePos();
					this.tracer.graphics.lineTo(this.tracePosition.x, this.tracePosition.y);
				}
			},

			setTracePos : function(){
				if(this.traceFrom){
					this.tracePosition.x = this.x - this.traceFrom.x;
					this.tracePosition.y = this.y - this.traceFrom.y;
				} else {
					this.tracePosition.x = this.x;
					this.tracePosition.y = this.y;
				}
			},

			addVX : function(val){
				this.velocity.x += val;
			},

			addVY :  function(val){
				this.velocity.y += val;
			}
		};

	});
