/**
	Controls the display/hiding of orbit lines depending on the camera that is active
*/

define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/BodyOrbit',
		'_'
	], 
	function(ns, $, BodyOrbit){
		'use strict';

		var OLM = {
			init : function(rootContainer){
				this.orbits = {};
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
			},
			
			onCameraChange : function(lookFromBody, lookAtBody) {

				var lookFromBodyOrbit = lookFromBody && this.orbits[lookFromBody.getName()];
				var lookAtBodyOrbit = lookAtBody && this.orbits[lookAtBody.getName()];

				if(lookFromBodyOrbit){
					this.hideAllOrbits();
					this.hideAllEcliptics();
					
					lookFromBodyOrbit.showEcliptic();

					if(lookAtBodyOrbit && lookAtBody.celestial.isOrbitAround(lookFromBody.celestial)) {
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
			}
		};

		return OLM;

	}
);