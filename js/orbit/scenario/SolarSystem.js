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
			title : 'Solar System',
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				//'moon',
				'mars',
				'jupiter',
				'saturn',
				'uranus',
				'neptune',
				'pluto',
				'halley'
			],
			secondsPerTick : 3600 * 5,
			calculateAll : false
		};

		return cnf;
		
	}
);