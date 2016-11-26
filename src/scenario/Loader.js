

// 		,'jsorrery/scenario/CommonCelestialBodies'
// 		,'jsorrery/scenario/SolarSystem'
// 		,'jsorrery/scenario/InnerSolarSystem'
// 		,'jsorrery/scenario/Apollo'
// 		,'jsorrery/scenario/EarthMoon'
// 		,'jsorrery/scenario/ArtificialSatellites'
// 		,'jsorrery/scenario/JupiterMoon'
// 		,'jsorrery/scenario/NearEarthObject'
// 		,'jsorrery/scenario/BigJupiter'
// 		//,'jsorrery/scenario/MoonSOI'

import commonBodies from './CommonCelestialBodies';

	const scenarios = {};
	const list = [];

	let scenario;
	for(var i = 3; i< arguments.length; i++) {
		scenario = arguments[i];
		scenario.bodies = scenario.bodies || {};

		if(scenario.commonBodies){
			$.each(scenario.commonBodies, function(i, bodyName) {
				scenario.bodies[bodyName] = $.extend({}, common[bodyName], scenario.bodies[bodyName]);
			});
		}
		scenarios[scenario.name] = scenario;
		list.push({
			name : scenario.name,
			title : scenario.title || scenario.name,
			help : scenario.help || ''
		});
	}


export default {
	get : function(which) {
		return scenarios[which];
	},
	getList : function(){
		return list;
	}
};

