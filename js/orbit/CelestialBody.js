

define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	], 
	function(ns, $) {

		return {

			init : function() {

				var speed = this.speed;
				var dist = this.dist;

				//do we have arguments at apogee?
				if(this.apogee && this.minSpeed) {
					speed = this.minSpeed;
					dist = this.apogee;
				}

				console.log(speed);

				this.velocity = new THREE.Vector3(0, speed * 1000, 0);//velocity is set in km/s, we need it in m/s
				this.position = new THREE.Vector3(dist * 1000, 0, 0);//position is set in KM, we need it in m
				this.tracePosition = new THREE.Vector3(dist * 1000, 0, 0);//position is set in KM, we need it in m
				this.force = new THREE.Vector3(0, 0, 0);
				
				this.isTracing = true;

				this.planet = new createjs.Shape();
				this.planet.graphics.beginFill(this.traceColor).drawCircle(0, 0, this.radius);

				this.tracerG = new createjs.Graphics();
				this.tracerG.setStrokeStyle(0.5);
				this.tracerG.beginStroke(this.traceColor);

				this.tracer = new createjs.Shape(this.tracerG);
				this.drawMove();
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

			doTrace : function(){
				if(this.isTracing){
					this.setTracePos();
					this.tracerG.lineTo(this.tracePosition.x, this.tracePosition.y);
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

			/**
			Calculate current angle relative to body we track from. If this body is not tracked from another body, track it from the universe.
			*/
			/*getAngle : function(){
				var trackFromPos:Vector3D;
				if(this.traceFrom){
					trackFromPos = this.traceFrom.position;
				} else {
					trackFromPos = new Vector3D(1,0);
				}
				
				var thisAngle = Vector3D.angleBetween(_position, trackFromPos);
			
			}/**/
		};

	});
