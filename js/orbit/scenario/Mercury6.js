/** 

mass : kg
dist : km
apeed : km/s
radius: km

Corrections have been added to element's altitude to compensate for imprecisions in parameters, so as to fit mechanical orbit to orbital elements.

*/

define(
	[
		'orbit/NameSpace'
	], 
	function(ns, $) {

		var earthRadius = 6371;

		var system =  {
			bodies : {
				earth : {
					mass : 5.9736e24,
					radius : earthRadius,
					color : "#1F7CDA",
					map : 'img/earthmap1k.jpg',
					sideralPeriod : 23 * 60 *60 + 56 * 60 + 4
				},
				mercury6 : {
					mass : 1224.7,
					radius : 2,
					color : "#ffffff",
					orbit : {
						base : {
							a : (earthRadius + 48 + 159) ,
							e : 0.00804,
							w : 0,
							M : 0,
							i : 32.5,
							o : 0
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : -1 * (360 / (88.5 * 60)) * ns.day,
							w : 0,
							o : 0
						}	
					}
				},
				hubble : {
					mass : 11110,
					radius : 2,
					color : "#ffaa00",
					orbit: {
						base : {
							a : (earthRadius + 19 + 586.47) ,
							e : 0.00172,
							w : 0,
							M : 0,
							i : 28.48,
							o : 0
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : -1 * (360 / (96.66 * 60)) * ns.day,
							w : 0,
							o : 0
						}	
					}

				},
				gemini6 : {
					mass : 1,
					radius : 2,
					color : '#00aaff',
					orbit: {
						base : {
							a : (earthRadius + 10 + 300) ,
							e : 0.0003,
							w : 0,
							M : 0,
							i : 28.89,
							o : 0
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : -1 * (360 / (90.55 * 60)) * ns.day,
							w : 0,
							o : 0
						}	
					}
				},
				gps : {
					mass : 1,
					radius : 2,
					color : '#00aaff',
					orbit: {
						base : {
							a : 26600,
							e : 0,
							w : 0,
							M : 0,
							i : 55,
							o : 0
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : (360 / (11*3600 + 58*60)) * ns.day,
							w : 0,
							o : 0
						}	
					}
					
				}/**/

				
			},
			
			secondsPerTick : 5,
			calculationsPerTick : 20

		};

		return system;
		
	}
);