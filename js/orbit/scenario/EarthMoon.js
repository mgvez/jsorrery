

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {

		
		var system =  {
			name : 'EarthMoon',
			commonBodies : ['earth', 'moon'],
			secondsPerTick : 3600,
			calculationsPerTick : 500,
			calculateAll : false
		};


		return system;
		
	}
);