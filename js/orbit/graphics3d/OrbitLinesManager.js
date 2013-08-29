/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'_'
	], 
	function(ns, $){
		'use strict';

		var bodies3d = [];
		var container;
		/**
		Reset the default behavior of every body's orbit line (show the orbit, not the ecliptic)
		*/
		var hideAllOrbits = function(){
			_.each(bodies3d, function(body3d){
				body3d.hideOrbit();
			});
		};
		var showAllOrbits = function(){
			_.each(bodies3d, function(body3d){
				body3d.showOrbit();
			});
		};
		var hideAllEcliptics = function(){
			_.each(bodies3d, function(body3d){
				body3d.hideEcliptic();
			});
		};


		var OLM = {
			init : function(containerParam){
				bodies3d.length = 0;
				container = containerParam;
			},

			addBody : function(body3d){
				bodies3d.push(body3d);
				
				
			},
			
			onCameraChange : function(lookFromBody, lookAtBody) {
				if(lookFromBody){
					hideAllOrbits();
					hideAllEcliptics();
					lookFromBody.showEcliptic();

					if(lookAtBody) {
						lookAtBody.showOrbit();
					}

				} else {
					showAllOrbits();
					hideAllEcliptics();
				}
			},

			resetAllOrbits : function() {
				_.each(bodies3d, function(body3d){
					body3d.recalculateOrbitLine(true);
				});
			},

			kill : function(){
				_.each(bodies3d, function(body3d){
					body3d.tracer && body3d.tracer.unlistenToVertexChange();
				});
			}
		};

		return OLM;

	}
);