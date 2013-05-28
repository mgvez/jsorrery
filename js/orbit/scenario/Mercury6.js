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
				mercury6 : {
					mass : 1224.7,
					dist : earthRadius + 159,
					speed : 28205/3600,
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
							M : (360 / (88.5 * 60)) * (60 * 60 * 24),
							w : 0,
							o : 0
						}	
					}
				},
				hubble : {
					mass : 11110,
					dist : earthRadius + 559,
					speed : 7500 / 1000,
					radius : 2,
					color : "#d5bd8d",
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
							M : (360 / (96.66 * 60)) * (60 * 60 * 24),
							w : 0,
							o : 0
						}	
					}

				},
				gemini6 : {
					mass : 1,
					dist : earthRadius + 304,
					speed : null,
					radius : 2,
					color : '#ffaacc',
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
							M : (360 / (90.55 * 60)) * (60 * 60 * 24),
							w : 0,
							o : 0
						}	
					}
				},/**/
				earth : {
					mass : 5.9736e24,
					dist : 0,
					speed : 0,
					radius : earthRadius,
					color : "#1F7CDA"
				}
			},
			
			secondsPerTick : 30,
			calculationsPerTick : 20,
			largestRadius : 10,

		};

		return system;
		
	}
);