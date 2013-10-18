
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/Utils',
		'three'
	], 
	function(ns, $, Utils) {
		'use strict';
		//a change of direction of x radians triggers a vertex switch in the path (equivalent to adding a vertex);
		var SWITCH_TRESHOLD = 0.005;
		var vNorm = new THREE.Vector3(1, 0, 0);

		return {
			init : function(color, nVertices, name){
				this.name = name;
				this.color = Utils.rgbToHex(Utils.darken(Utils.hexToRgb(color), 0.7));
				this.points = [];
				this.nVertices = nVertices;
				this.lastVertexIdx = this.nVertices - 1;
				this.lastMod = 0;
				this.root = new THREE.Object3D();
				this.tracePosition = new THREE.Vector3();
			},

			getDisplayObject : function(){
				return this.root;
			},

			getNew : function() {
				
				this.detachTrace();

				var material = new THREE.LineBasicMaterial({
					color: this.color
				});

				this.geom = new THREE.Geometry();
				for(var i=0; i<this.nVertices; i++){
					this.geom.vertices.push(new THREE.Vector3(0, 0, 0));
				}
				this.line = new THREE.Line(this.geom, material);
				this.currentVertex = 0;
				this.initCallback = this.changeVertex.bind(this);
				this.attachTrace();
			},

			detachTrace : function() {
				this.line && this.root.remove(this.line);
			},

			attachTrace : function() {
				this.line && this.root.add(this.line);
			},

			setTraceFrom : function(traceFromBody) {
				if(this.traceFrom !== traceFromBody) this.getNew();
				this.traceFrom = traceFromBody;
				if(!traceFromBody) {
					this.root.position.set(0, 0, 0);
				}
			},

			changeVertex : function(){
				this.lastPathDirection = null;
				this.switchVertex = this.currentVertex === this.lastVertexIdx;
				this.currentVertex < this.lastVertexIdx && this.currentVertex++;
			},

			doTrace : function(pos){
				if(!this.geom) return;
				var i;
				pos = this.setTracePos(pos);
				if(this.geom.vertices[this.currentVertex] && this.geom.vertices[this.currentVertex].distanceTo(pos) ==0 ) return;
				this.geom.verticesNeedUpdate = true;
				
				if(this.currentVertex < this.lastVertexIdx) {
					for(i = this.currentVertex; i < this.nVertices; i++) {
						this.geom.vertices[i].copy(pos);
					}
				} else {
					if(this.switchVertex){
						for(i = 0; i < this.lastVertexIdx; i++) {
							this.geom.vertices[i].copy(this.geom.vertices[i+1]);
						}
						this.switchVertex = false;
					}
					this.geom.vertices[this.lastVertexIdx].copy(pos);
				}

				var v2 = this.geom.vertices[this.currentVertex-2]; 
				var v1 = this.geom.vertices[this.currentVertex-1]; 
				var v0 = this.geom.vertices[this.currentVertex];
				
				if(v1 && v2) {

					if(!this.lastPathDirection) {
						var a = v1.clone().sub(v2);
						this.lastPathDirection = Math.abs(a.angleTo(vNorm));
					}
					var curPath = v0.clone().sub(this.previousPos);
					var diff = Math.abs(this.lastPathDirection - Math.abs(curPath.angleTo(vNorm)));
					if(diff > SWITCH_TRESHOLD){
						this.changeVertex();
					}

				}

				if(!v1 || !v2){
					this.changeVertex();
				}
				this.previousPos = pos;
							
			},

			setTracePos : function(pos){
				if(this.traceFrom){
					this.root.position.copy(this.traceFrom.getPosition());
					pos.sub(this.traceFrom.getPosition());
				}
				return pos;
			}

		};


	}

);