/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies'
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
			secondsPerTick : {min: 3600*5, max: 3600 * 25, initial:3600 * 10},
			defaultGuiSettings : { 
				planetScale : 10
			},
			help : "This scenario shows all the planets of the Solar System. Also included is Halley's comet, but its orbit is an approximation, as it is perturbed by the planet's masses."
		};

		return cnf;
		
	}
);