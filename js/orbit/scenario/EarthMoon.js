/** 


*/

define(
	[
		'orbit/NameSpace'
	], 
	function(ns, $) {

		
		var system =  {
			bodies : {
				moon : {
					mass : 7.3477e22,
					dist : 0.00257 * ns.AU,
					speed : 1.022,
					radius : 1738100,
					traceColor : "#ffffff",
					apogee : 405410,
					minSpeed : 0.964
				},
				earth : {
					mass : 5.9736e24,
					dist : 0,
					speed : 0,
					radius : 6378100,
					traceColor : "#1F7CDA"
				}
			},
			
			secondsPerTick : 36000,
			largestRadius : 5,
			smallestRadius : 1,

		};

		//make system stable
		//system.bodies.earth.speed = -1 * system.bodies.moon.speed * (system.bodies.moon.mass / system.bodies.earth.mass);
		system.bodies.earth.speed = -1 * system.bodies.moon.minSpeed * (system.bodies.moon.mass / system.bodies.earth.mass);


		return system;
		
	}
);