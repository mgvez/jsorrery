

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
					map : 'img/moonmap1k.jpg',
					sideralPeriod : -27.321582 * ns.day,
					orbit: {
						base : {
							a : 384400,
							e : 0.0554,
							w : 318.15,
							M : 135.27,
							i : 5.16,
							o : 125.08
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : 360 / 27.322,
							w : (360 / 5.997) / 365.25,
							o : (360 / 18.600) / 365.25
						}	
					}
				},
				earth : {
					mass : 5.9736e24,
					radius : 6378.1,
					color : "#1F7CDA",
					map : 'img/earthmap1k.jpg',
					sideralPeriod : 23 * 60 *60 + 56 * 60 + 4
				}
			},
			
			secondsPerTick : 1000,
			calculationsPerTick : 300

		};


		return system;
		
	}
);