
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
				pos = this.setTracePos(pos);
				//console.log(pos);
			    this.geom.verticesNeedUpdate = true;
				if(this.currentVertex < this.nVertices) {
					for(var i = this.currentVertex; i < this.nVertices; i++) {
						this.geom.vertices[i].copy(pos);
					}
				} else {
					var lastVertexIdx = this.nVertices - 1;
					if(this.switchVertex){
						for(var i = 0; i < lastVertexIdx; i++) {
							this.geom.vertices[i].copy(this.geom.vertices[i+1]);
						}
						this.switchVertex = false;
					}
					this.geom.vertices[this.geom.vertices.length-1].copy(pos);
				}
			},

			setTracePos : function(pos){
				if(this.traceFrom){
					this.root.position.copy(this.traceFrom.getPosition());
					pos.sub(this.traceFrom.getPosition());
				}
				return pos;
			},

			initPos : function(pos) {

				this.setTracePos(pos);
				this.geom.vertices[0].copy(pos);
				this.currentVertex = 1;

			}

		};


	}

);