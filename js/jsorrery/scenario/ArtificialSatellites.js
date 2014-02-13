/** 

Corrections have been added to element's altitude to compensate for imprecisions in parameters, so as to fit mechanical orbit to orbital elements.

*/

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies',
		'jsorrery/scenario/NasaNumbers'
	], 
	function(ns, common, nasaNumbers) {

		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var system =  {
			name : 'Artificial',
			title : 'Artificial satellites around the Earth',
			commonBodies : ['earth'],
			bodies : {
				/*earth: {
					map : 'img/earthmap1k_KSC.jpg'
				},/**/
				mercury6 : {
					title : 'Mercury 6',
					mass : 1224.7,
					radius : 2,
					color : "#ffffff",
					orbit : {
						relativeTo : 'earth',
						base : {
							a : ((earthRadius * 2) + 159 + 265) / 2 ,
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
				mercury7 : 
					_.extend({
							title : 'Mercury 7',
							mass : 1,
							radius : 2,
							color : "#ffffff"
						},
						nasaNumbers.get('earth', 'Mercury7')
					)
				,
				Mercury8 : 
					_.extend({
							title : 'Mercury 8',
							mass : 1,
							radius : 2,
							color : "#ffffff"
						},
						nasaNumbers.get('earth', 'Mercury8')
					)
				,
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
							a : ((earthRadius * 2) + 161 + 259.4) / 2 ,
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
				}
			},
			
			secondsPerTick : {min: 1, max: 10, initial:5},
			help : "A selection of artificial satellites orbiting the Earth. They were not launched in the same years, so the epoch is irrelevent in this simulation. The numbers I have for these orbits are incomplete. The shape and inclination of the orbits are correct, but I don't have epoch and orientation information. I included this scenario to show the differences between these satellite's orbits shapes."

		};

		return system;
		
	}
);