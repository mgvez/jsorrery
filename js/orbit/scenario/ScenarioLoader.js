
define(
	[
		'jquery',
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies',
		'orbit/scenario/SolarSystem',
		'orbit/scenario/InnerSolarSystem',
		'orbit/scenario/Apollo',
		'orbit/scenario/EarthMoon',
		'orbit/scenario/ArtificialSatellites',
		'orbit/scenario/JupiterMoon',
	],
	function($, ns, common){


		var scenarios = {};
		var list = [];
		var scenario;
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
				title : scenario.title || scenario.name
			});
		}


		return {
			get : function(which) {
				return scenarios[which];
			},
			getList : function(){
				return list;
			}
		};
	}
);
