
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Utils',
		'three'
	], 
	function(ns, $, Utils) {
		

		return {
			init : function(color, nVertices, name){
				this.name = name;
				this.color = Utils.rgbToHex(Utils.darken(Utils.hexToRgb(color), 0.7));

				this.nVertices = nVertices;
				this.lastMod = 0;
				this.root = new THREE.Object3D();
				this.tracePosition = new THREE.Vector3();
				this.getNew();
				this.currentVertex = 0;
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

			getNew : function() {
				
				this.line && this.root.remove(this.line);

				var material = new THREE.LineBasicMaterial({
			        color: this.color
			    });

			    this.trace = new THREE.Geometry();
			    for(var i=0; i<this.nVertices; i++){
				    this.trace.vertices.push(new THREE.Vector3(0, 0, 0));
				}
			    this.line = new THREE.Line(this.trace, material);
			    this.root.add(this.line);
			    this.currentVertex = 0;

			},

			setTraceFrom : function(traceFromBody) {
				if(this.traceFrom !== traceFromBody) this.getNew();
				this.traceFrom = traceFromBody;
				if(!traceFromBody) {
					this.root.position.x = this.root.position.y = this.root.position.z = 0;
				}
			},

			changeVertex : function(){
				this.currentVertex < this.nVertices && this.currentVertex++;
				this.switchVertex = true;
			},

			doTrace : function(pos){
				pos = this.setTracePos(pos);
			    this.trace.verticesNeedUpdate = true;
				if(this.currentVertex < this.nVertices) {
					for(var i = this.currentVertex; i < this.nVertices; i++) {
						this.trace.vertices[i].copy(pos);
					}
				} else {
					var lastVertexIdx = this.nVertices - 1;
					if(this.switchVertex){
						for(var i = 0; i < lastVertexIdx; i++) {
							this.trace.vertices[i].copy(this.trace.vertices[i+1]);
						}
						this.switchVertex = false;
					}
					this.trace.vertices[this.trace.vertices.length-1].copy(pos);
				}
			},

			setTracePos : function(pos){
				if(this.traceFrom){
					this.root.position.copy(this.traceFrom.getPlanet().position);
					pos.sub(this.traceFrom.getPlanet().position);

				}
				return pos;
			},

			initPos : function(pos) {

				this.setTracePos(pos);
				this.trace.vertices[0].copy(pos);
				this.currentVertex = 1;

			}

		};


	}

);