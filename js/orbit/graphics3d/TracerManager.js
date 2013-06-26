

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/gui/Gui',
		'three'
	], 
	function(ns, $, Gui) {

		var bodies;
		var domEl;
		var selector;
		
		var toggleTraceFrom : function(){

		};

		var TM = {
			init : function(container){
				bodies = [];
				domEl = container;	
				selector = Gui.addDropdown('traceFrom', 'Trace from', toggleTraceFrom);
			},

			addBody : function(b){				
				Gui.addOption('traceFrom', b.getName(), bodies.length);
				bodies.push(b);
			}
		};

		return TM;

	});
