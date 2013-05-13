/** 

mass : kg
dist : km
apeed : km/s
radius: km

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
					radius : 1738.1,
					color : "#ffffff",
					dist : 405410,
					speed : 0.964
				},
				earth : {
					mass : 5.9736e24,
					dist : 0,
					speed : 0,
					radius : 6378.1,
					color : "#1F7CDA"
				}
			},
			
			secondsPerTick : 36000,
			calculationsPerTick : 300,
			largestRadius : 5,

		};

		//make system stable
		//system.bodies.earth.speed = -1 * system.bodies.moon.speed * (system.bodies.moon.mass / system.bodies.earth.mass);
		system.bodies.earth.speed = -1 * system.bodies.moon.speed * (system.bodies.moon.mass / system.bodies.earth.mass);


		return system;
		
	}
);