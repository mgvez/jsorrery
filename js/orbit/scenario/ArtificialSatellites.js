/** 

Corrections have been added to element's altitude to compensate for imprecisions in parameters, so as to fit mechanical orbit to orbital elements.

*/

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {

		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var system =  {
			name : 'Artificial',
			title : 'Artificial satellites around the Earth',
			commonBodies : ['earth'],
			bodies : {
				earth: {
					map : 'img/earthmap1k_KSC.jpg'
				},
				mercury6 : {
					title : 'Mercury 6',
					mass : 1224.7,
					radius : 2,
					color : "#ffffff",
					orbit : {
						relativeTo : 'earth',
						base : {
							a : (earthRadius + 40 + 159) ,
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
							M : (360 / (88.5 * 60)) * ns.DAY,
							w : 0,
							o : 0
						}	
					}
				},
				hubble : {
					title : 'Hubble ST',
					mass : 11110,
					radius : 2,
					color : "#ffaa00",
					orbit: {
						relativeTo : 'earth',
						base : {
							a : (earthRadius + 11 + 586.47) ,
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
							M : (360 / (96.66 * 60)) * ns.DAY,
							w : 0,
							o : 0
						}	
					}

				},
				gemini6 : {
					title : 'Gemini 6A',
					mass : 1,
					radius : 2,
					color : '#00aaff',
					orbit: {
						relativeTo : 'earth',
						base : {
							a : (earthRadius + 2 + 300) ,
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
							M : (360 / (90.55 * 60)) * ns.DAY,
							w : 0,
							o : 0
						}	
					}
				},
				gps : {
					title : 'Typical GPS Satellite',
					mass : 1,
					radius : 2,
					color : '#00aaff',
					orbit: {
						relativeTo : 'earth',
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
							M : (360 / (11*3600 + 58*60)) * ns.DAY,
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