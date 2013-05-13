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
				mercury6 : {
					mass : 1224.7,
					dist : 6378 + 159,
					speed : 28205/3600,
					radius : 2,
					color : "#ffffff",
				},
				hubble : {
					mass : 11110,
					dist : 6378 + 559,
					speed : 7500 / 1000,
					radius : 2,
					color : "#d5bd8d",
				},
				earth : {
					mass : 5.9736e24,
					dist : 0,
					speed : 0,
					radius : 6378,
					color : "#1F7CDA"
				}
			},
			
			secondsPerTick : 30,
			calculationsPerTick : 20,
			largestRadius : 10,

		};

		return system;
		
	}
);