

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {
		
		var system =  {
			name : 'EarthMoon',
			title : 'The Moon and the Earth',
			commonBodies : ['earth', 'moon'],
			secondsPerTick : 3600,
			calculationsPerTick : 2000,
			calculateAll : false
		};

		return system;
		
	}
);