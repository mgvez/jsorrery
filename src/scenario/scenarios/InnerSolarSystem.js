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
					calculateFromElements : true
				}
			},
			secondsPerTick : {min: 3600, max: 3600 * 15, initial:3600 * 5},//3600 * 24 * 2,
			defaultGuiSettings : { 
				planetScale : 10
			},
			help:"Includes all the planets from Mercury to Mars, plus the Earth's moon."
		};

		return cnf;
		
	}
);