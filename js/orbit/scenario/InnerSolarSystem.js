/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {

		var cnf = {
			name : 'InnerSolarSystem',
			title : 'Inner Solar System',
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				'moon',
				'mars'
			],
			bodies : {
				moon : {
					isPerturbedOrbit : true
				}
			},
			secondsPerTick : 3600,//3600 * 24 * 2,
			calculateAll : true,
			defaultsGuiSettings : { 
				planetScale : 10
			}
		};

		return cnf;
		
	}
);