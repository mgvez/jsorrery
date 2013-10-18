/**
	Controls the trace of a body relative to another. Traces are not orbit lines, they are the path trace of a body relative to another
*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'three'
	], 
	function(ns, $, Tracer) {
		'use strict';

		//number of tracing vertices. It was previously taken directly from the orbit's size, but a constant number is more convenient
		var N_VERTICES = 1000;

		var TM = {
			init : function(containerParam){
				this.bodies3d = [];
				this.container = containerParam;
			},

			setTraceFrom : function(lookFromBody, lookAtBody){
				
				this.traceFromBody = lookFromBody;
				this.tracingBody = lookAtBody;
				this.resetTrace();
			},

			resetTrace : function(){
				this.removeTracers();
				if(!this.traceFromBody || !this.tracingBody) return;
				this.tracer = this.tracingBody.tracer;
				if(!this.tracer) return;
				this.tracer.setTraceFrom(this.traceFromBody);
				this.tracer.getNew();
				this.container.add(this.tracer.getDisplayObject());
			},

			removeTracers : function(){
				var container = this.container;
				
				_.each(this.bodies3d, function(body3d){
					if(body3d.celestial.forceTrace) return;
					var tracer = body3d.tracer;
					//clear all traces first
					if(!tracer) return;
					container.remove(tracer.getDisplayObject());
					
				});
			},

			draw : function() {
				if(this.deferredForceTraceBody) {
					this.setTraceFrom(ns.U.getBody(this.deferredForceTraceBody.celestial.relativeTo).getBody3D(), this.deferredForceTraceBody);
					this.deferredForceTraceBody = null;
				}
			},

			addBody : function(body3d){

				this.bodies3d.push(body3d);

				if(body3d.celestial.isCentral) return;

				var tracer = Object.create(Tracer);
				tracer.init(body3d.celestial.traceColor || body3d.celestial.color, N_VERTICES, body3d.celestial.name);
				body3d.tracer = tracer;

				if(body3d.celestial.forceTrace) {
					this.deferredForceTraceBody = body3d;
				}
				
			},

			kill : function(){
			}
		};

		return TM;

	});
