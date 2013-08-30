/**
	Controls the trace of a body relative to another. Traces are not orbit lines, they are the path trace of a body relative to another
*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'orbit/gui/Gui',
		'three'
	], 
	function(ns, $, Tracer, Gui) {
		'use strict';

		var toggleTraceFrom = function(){
			var centralBody3d = this.bodies3d[this.selector.val()];
			var container = this.container;
			_.each(this.bodies3d, function(body3d){
				//clear all traces first
				var tracer = body3d.tracer;
				if(!tracer) return;
				tracer.setTraceFrom(centralBody3d);
				tracer.unlistenToVertexChange();

				if(centralBody3d && centralBody3d != body3d) {
					tracer.getNew();
					tracer.listenToVertexChange(body3d.celestial);
					//also listen to the "from" body tracer events to trace the "at" body, as the latter's rythm might not be sufficient
					tracer.listenToVertexChange(centralBody3d.celestial);
					container.add(tracer.getDisplayObject());
				} else {
					container.remove(tracer.getDisplayObject());
				}
			});
		};
		

		var TM = {
			init : function(containerParam){
				this.bodies3d = [];
				this.container = containerParam;
				this.toggleTraceFrom = toggleTraceFrom.bind(this);
				this.selector = Gui.addDropdown('traceFrom', this.toggleTraceFrom);
				Gui.addOption('traceFrom', 'none', null);
				this.toggleTraceFrom();
			},

			addBody : function(body3d){

				Gui.addOption('traceFrom', body3d.getName(), this.bodies3d.length);
				this.bodies3d.push(body3d);

				if(body3d.celestial.isCentral) return;

				var tracer = Object.create(Tracer);
				tracer.init(body3d.celestial.color, body3d.celestial.nVertices, body3d.celestial.name);
				
				body3d.tracer = tracer;
				
			},

			kill : function(){
				_.each(this.bodies3d, function(body3d){
					body3d.tracer && body3d.tracer.unlistenToVertexChange();
				});
			}
		};

		return TM;

	});
