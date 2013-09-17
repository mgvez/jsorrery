/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/graphics3d/BodyOrbit',
		'orbit/graphics3d/TracerManager',
		'_'
	], 
	function(ns, $, BodyOrbit, TracerManager){
		'use strict';

		var OLM = {
			init : function(rootContainer){
				this.orbits = {};
				TracerManager.init(rootContainer);
			},

			/**
			Reset the default behavior of every orbit's orbit line (show the orbit, not the ecliptic)
			*/
			hideAllOrbits : function(){
				_.each(this.orbits, function(orbit){
					orbit.hideOrbit();
				});
			},
			
			showAllOrbits : function(){
				_.each(this.orbits, function(orbit){
					orbit.showOrbit();
				});
			},
			
			hideAllEcliptics : function(){
				_.each(this.orbits, function(orbit){
					orbit.hideEcliptic();
				});
			},

			addBody : function(body3d){
				var orbit = Object.create(BodyOrbit);
				orbit.init(body3d);
				this.orbits[body3d.getName()] = orbit;

				TracerManager.addBody(body3d);
			},
			
			onCameraChange : function(lookFromBody, lookAtBody) {

				var lookFromBodyOrbit = lookFromBody && this.orbits[lookFromBody.getName()];
				var lookAtBodyOrbit = lookAtBody && this.orbits[lookAtBody.getName()];

				if(lookFromBodyOrbit){
					this.hideAllOrbits();
					this.hideAllEcliptics();
					
					lookFromBodyOrbit.showEcliptic();

					/*if(lookAtBodyOrbit) {
						lookAtBodyOrbit.showOrbit();
					}/**/

				} else {
					this.showAllOrbits();
					this.hideAllEcliptics();
				}
			},

			resetAllOrbits : function() {
				_.each(this.orbits, function(orbit){
					orbit.recalculateOrbitLine(true);
				});
			},

			kill : function(){
				_.each(this.orbits, function(orbit){
					orbit.kill();
				});

				TracerManager.kill();
			}
		};

		return OLM;

	}
);