
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Utils',
		'three'
	], 
	function(ns, $, Utils) {
		
		var nVertices = 100;
		var positionEach = (Math.PI * 2) / nVertices;

		return {
			init : function(color, period, name){
				this.name = name;
				this.color = Utils.rgbToHex(Utils.darken(Utils.hexToRgb(color), 0.7));

				this.traceEach = Math.ceil(period / 100);
				this.lastMod = 0;
				this.root = new THREE.Object3D();
				this.tracePosition = new THREE.Vector3();
				this.getNew();
			},

			spotPos : function(x, y, color, size) {
				var shape = new createjs.Shape();
				shape.graphics.clear();
				shape.graphics.beginFill(color || this.color).drawCircle(x, y, size || 1);
				this.root.addChild(shape);

			},

			getDisplayObject : function(){
				return this.root;
			},

			getNew : function(keepOld) {

				
				var material = new THREE.LineBasicMaterial({
			        color: this.color
			    });

			    this.trace = new THREE.Geometry();
			    for(var i=0; i<nVertices; i++){
				    this.trace.vertices.push(new THREE.Vector3(0, 0, 0));
				}
			    var line = new THREE.Line(this.trace, material);
			    this.root.add(line);

			    this.currentVertice = 0;

			},

			setTraceFrom : function(centralBody) {
				this.traceFrom = centralBody;
	            this.tracePosition.x = this.tracePosition.x - this.traceFrom.x;
				this.tracePosition.y = this.tracePosition.y - this.traceFrom.y;
				this.tracePosition.z = this.tracePosition.z - this.traceFrom.z;
				this.currentTrace.graphics.moveTo(this.tracePosition.x, this.tracePosition.y);
			},

			doTrace : function(pos){
				
				if(!this.origPos){
					this.origPos = pos;
					this.origPos.normalize();
					return;
				}
				var angle = pos.angleTo(this.origPos);
				var curInc = Math.floor(Math.abs(angle / positionEach));

				if(this.name=='earth'){
					//console.log(pos.normalize().dot(this.origPos)+1);
					//console.log(angle);

					var axis = this.origPos.clone().cross(pos.normalize());
					axis.normalize();/**/
					var angles = Math.acos(this.origPos.dot(pos.normalize()));
					//console.log(axis);
					//console.log(angles-angle);
					/*quat = AxisAngle2Quaternion(axis, angle)
					rot = Quaternion2Matrix(quat)
					cube.matrix = rot;/**/
					return;
				}
				//console.log(curInc);
				/*if(this.lastAngle){
					var dif = Math.abs(angle - this.lastAngle);
					this.dif = (this.dif || 0) + dif;

					//console.log(this.dif);
					if(this.dif >= positionEach) {
						this.dif = 0;
						this.currentVertice = ++this.currentVertice % nVertices;
					}
				}
				this.lastAngle = angle;/**/
		
				this.setTracePos(pos);
			    this.trace.verticesNeedUpdate = true;
				this.tracePosition = pos;
				
				for(var i = curInc; i < nVertices; i++) {
					this.trace.vertices[i].copy(pos);
				}

			},

			setTracePos : function(pos){
				if(this.traceFrom){
					this.root.position.copy(this.traceFrom.x);
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