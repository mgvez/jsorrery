

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'orbit/gui/Gui',
		'three'
	], 
	function(ns, $, Tracer, Gui) {

		var bodies3d;
		var container;
		var selector;
		
		var toggleTraceFrom = function(){
			var centralBody3d = bodies3d[selector.val()];

			_.each(bodies3d, function(body3d){
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
				bodies3d = [];
				container = containerParam;	
				selector = Gui.addDropdown('traceFrom', 'Trace paths relative to', toggleTraceFrom);
				Gui.addOption('traceFrom', 'none', null);
				toggleTraceFrom();
			},

			addBody : function(body3d){

				Gui.addOption('traceFrom', body3d.getName(), bodies3d.length);
				bodies3d.push(body3d);

				if(body3d.celestial.isCentral) return;

				var tracer = Object.create(Tracer);
				tracer.init(body3d.celestial.color, body3d.celestial.nVertices, body3d.celestial.name);
				
				body3d.tracer = tracer;
				
			},
			kill : function(){
				_.each(bodies3d, function(body3d){
					body3d.tracer && body3d.tracer.unlistenToVertexChange();
				});
			}
		};

		return TM;

	});
