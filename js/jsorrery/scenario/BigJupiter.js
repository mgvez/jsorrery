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
			name : 'BigJupiter',
			title : 'If Jupiter was 5000X its mass',
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
				'pluto'
			],

			bodies:{
				jupiter:{
					mass: 5.6846e26 * 1000,
					forceTrace: true
				},
				mercury:{
					forceTrace: true
				},
				venus:{
					forceTrace: true
				},
				earth:{
					forceTrace: true
				},
				mars:{
					forceTrace: true
				},
				saturn:{
					forceTrace: true
				},
				uranus:{
					forceTrace: true
				},
				neptune:{
					forceTrace: true
				},
				pluto:{
					forceTrace: true
				}
			},
			secondsPerTick : 3600 * 5,
			calculaionsPerTick : 100,
			usePhysics: true,
			calculateAll : true,
			defaultGuiSettings : { 
				planetScale : 10
			},
			help : "This scenario shows what would happen if, at this moment, Jupiter's mass was 5000 times larger."
		};

		return cnf;
		
	}
);