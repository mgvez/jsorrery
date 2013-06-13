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
			name : 'SolarSystem',
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				'mars',
				'jupiter',
				'saturn',
				'uranus',
				'neptune',
				'pluto',
				'halley'
			],
			secondsPerTick : 3600 * 12,//3600 * 24 * 2,
			calculationsPerTick : 500,
			calculatePerturbations : false,
			fov : 5
		};

		return cnf;
		
	}
);