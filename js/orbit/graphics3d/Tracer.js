
define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Utils',
		'three'
	], 
	function(ns, $, Utils) {
		'use strict';
		return {
			init : function(color, nVertices, name){
				this.name = name;
				this.color = Utils.rgbToHex(Utils.darken(Utils.hexToRgb(color), 0.7));
				this.points = [];
				this.nVertices = nVertices;
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
				this.previous = 0;
				this.initCallback = this.changeVertex.bind(this);
				this.attachTrace();
			},

			detachTrace : function() {
				this.line && this.root.remove(this.line);
			},

			attachTrace : function() {
				this.line && this.root.add(this.line);
			},

			listenToVertexChange : function(celestialBody) {
				if(!celestialBody) return;
				this.listeners = this.listeners || [];
				var listener = {
					dispatcher : celestialBody,
					event : 'vertex',
					handler : this.changeVertex.bind(this)
				};
				listener.dispatcher.addEventListener(listener.event, listener.handler);
				this.listeners.push(listener);
			},
			
			unlistenToVertexChange : function() {
				if(!this.listeners) return;
				var listener;
				while(listener = this.listeners.pop()){
					listener.dispatcher.removeEventListener(listener.event, listener.handler);
				}
			},

			setTraceFrom : function(traceFromBody) {
				if(this.traceFrom !== traceFromBody) this.getNew();
				this.traceFrom = traceFromBody;
				if(!traceFromBody) {
					this.root.position.set(0, 0, 0);
				}
			},

			changeVertex : function(){
				this.currentVertex < this.nVertices && this.currentVertex++;
				this.switchVertex = true;
			},

			doTrace : function(pos){
				if(!this.geom) return;
				var i;
				pos = this.setTracePos(pos);
				/*console.clear();
				console.log(pos);
				console.log(this.geom.vertices[this.currentVertex]);/**/
				if(this.geom.vertices[this.currentVertex].distanceTo(pos) ==0) return;
				this.geom.verticesNeedUpdate = true;
				
					
				
				if(this.currentVertex < this.nVertices) {
					for(i = this.currentVertex; i < this.nVertices; i++) {
						this.geom.vertices[i].copy(pos);
					}
				} else {
					var lastVertexIdx = this.nVertices - 1;
					if(this.switchVertex){
						for(i = 0; i < lastVertexIdx; i++) {
							this.geom.vertices[i].copy(this.geom.vertices[i+1]);
						}
						this.switchVertex = false;
					}
					this.geom.vertices[this.geom.vertices.length-1].copy(pos);
				}

				var v2 = this.geom.vertices[this.currentVertex-2]; 
				v2 = v2 && v2.clone();
				var v1 = this.geom.vertices[this.currentVertex-1]; 
				v1 = v1 && v1.clone();
				var v0 = this.geom.vertices[this.currentVertex].clone();
				var vNorm = new THREE.Vector3(1, 0, 0);
				
				//console.log(this.diff);
				//console.log(diff);
				if(v1 && v2) {

					var a = v1.sub(v2);
					var b = v0.sub(this.previous);
					var diff = Math.abs(Math.abs(a.angleTo(vNorm)) - Math.abs(b.angleTo(vNorm)));
					if(diff > 0.005){
						this.changeVertex();
					}

				}

				if(!v1 || !v2){
					this.changeVertex();
				}
				this.previous = pos;
							
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