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
			name : 'CentralSolarSystem',
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				'moon',
				'mars'
			],
			secondsPerTick : 3600,//3600 * 24 * 2,
			calculationsPerTick : 500,
			calculatePerturbations : true,
			fov : 20
		};

		return cnf;
		
	}
);