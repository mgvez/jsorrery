
define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	], 
	function(ns, $) {

		return {
			init : function(color){
				this.color = color;
				this.root = new createjs.Container();

				this.tracePosition = new THREE.Vector3();
				this.getNew();
			},

			spotPos : function(x, y) {
				var shape = new createjs.Shape();
				shape.graphics.clear();
				shape.graphics.beginFill(this.color).drawCircle(x, y, 1);
				this.root.addChild(shape);

			},

			getDisplayObject : function(){
				return this.root;
			},

			getNew : function(keepOld) {

				if (this.currentTrace && keepOld) {
					this.traces = this.traces || [];
					this.traces.push(this.currentTrace);
				} else if(!this.traceFrom) {
					this.root.removeChild(this.currentTrace);
				}

				this.currentTrace = new createjs.Shape();
				this.currentTrace.graphics.clear();
				this.currentTrace.graphics.moveTo(this.tracePosition.x, this.tracePosition.y);

				this.currentTrace.graphics.setStrokeStyle(0.5);
				this.currentTrace.graphics.beginStroke(this.color);
				this.root.addChild(this.currentTrace);
			},

			setTraceFrom : function(centralBody) {
				this.traceFrom = centralBody;
	            this.tracePosition.x = this.tracePosition.x - this.traceFrom.x;
				this.tracePosition.y = this.tracePosition.y - this.traceFrom.y;
				this.currentTrace.graphics.moveTo(this.tracePosition.x, this.tracePosition.y);
			},

			doTrace : function(x, y){
				this.setTracePos(x, y);
				this.currentTrace.graphics.lineTo(this.tracePosition.x, this.tracePosition.y);
			},

			setTracePos : function(x, y){
				if(this.traceFrom){
					this.root.x = this.traceFrom.x;
					this.root.y = this.traceFrom.y;
					this.tracePosition.x = x - this.traceFrom.x;
					this.tracePosition.y = y - this.traceFrom.y;
				} else {
					this.tracePosition.x = x;
					this.tracePosition.y = y;
				}
			},

			initPos : function(x, y) {

				this.setTracePos(x, y);
				if(this.currentTrace) {
					this.currentTrace.graphics.moveTo(this.tracePosition.x, this.tracePosition.y);
				}

			}

		};


	}

);