/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'orbit/NameSpace'
	], 
	function(ns, $) {

		
		var system =  {
			bodies : {
				moon : {
					mass : 7.3477e22,
					radius : 1738.1,
					color : "#ffffff",
					dist : 405410,
					speed : 0.964,
					orbit: {
						base : {
							a : 384400 / ns.AU,
							e : 0.0554,
							w : 318.15,
							M : 135.27,
							i : 5.16,
							N : 125.08
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : 360 / 27.322,
							w : (360 / 5.997) / 365.25,
							N : (360 / 18.600) / 365.25
						}	
					}
				},
				earth : {
					mass : 5.9736e24,
					dist : 0,
					speed : 0,
					radius : 6378.1,
					color : "#1F7CDA"
				}
			},
			
			secondsPerTick : 3600,
			calculationsPerTick : 300,
			largestRadius : 5,

		};


		return system;
		
	}
);