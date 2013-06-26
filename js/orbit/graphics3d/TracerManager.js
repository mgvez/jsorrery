

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/Tracer',
		'orbit/gui/Gui',
		'three'
	], 
	function(ns, $, Tracer, Gui) {

		var bodies;
		var container;
		var selector;
		
		var toggleTraceFrom = function(){
			var centralBody = bodies[selector.val()];

			_.each(bodies, function(b){
				//clear all traces first
				var tracer = b.tracer;
				if(!tracer) return;
				tracer.setTraceFrom(centralBody);
				tracer.unlistenToVertexChange();

				if(centralBody && centralBody != b) {
					tracer.getNew();
					tracer.listenToVertexChange(b.celestial);
					//also listen to the "from" body tracer events to trace the "at" body, as the latter's rythm might not be sufficient
					tracer.listenToVertexChange(centralBody.celestial);
					container.add(tracer.getDisplayObject());
				} else {
					container.remove(tracer.getDisplayObject());
				}
			});
		};

		var TM = {
			init : function(containerParam){
				bodies = [];
				container = containerParam;	
				selector = Gui.addDropdown('traceFrom', 'Trace paths relative to', toggleTraceFrom);
				Gui.addOption('traceFrom', 'none', null);
				toggleTraceFrom();
			},

			addBody : function(b){

				Gui.addOption('traceFrom', b.getName(), bodies.length);
				bodies.push(b);

				if(b.celestial.isCentral) return;

				var tracer = Object.create(Tracer);
				tracer.init(b.celestial.color, b.celestial.nVertices, b.celestial.name);
				
				b.tracer = tracer;
				
			}
		};

		return TM;

	});
