/*
	Global vars
*/

(function(ns, undefined) {
	define([], 
	function() {

		ns.app = null;
		ns.name = 'orbit';
		ns.version = '2013-05-07';

		ns.G = 6.673e-11;//gravitational constant to measure the force with masses in kg and radii in meters N(m/kg)^2
		ns.AU = 149597870;//astronomical unit in km
		ns.CIRCLE = 2 * Math.PI;
		ns.KM = 1000;
		ns.DEG_TO_RAD = Math.PI/180;
		ns.RAD_TO_DEG = 180/Math.PI;
		
		ns.DAY = 60 * 60 * 24;//duration in seconds
		ns.YEAR = 365.25;//duration in days
		ns.CENTURY = 100 * ns.YEAR;//duration in days
		ns.SIDERAL_DAY = 3600 * 23.9344696;

		var J2000 = new Date(2000, 0, 1);
		var startDate = new Date();
		//startDate = new Date(2012, 6, 1);
		//startDate = new Date(1986, 1, 9);
		startDate = new Date(2001, 1, 1);
		//startDate = J2000;
		ns.startEpochTime =  ((startDate - J2000) / 1000) ;

		ns.largestBodyMinimalSize = 0.1;
		ns.smallestBodyMinimalSize = 0.01;

		ns.axisToShowInY = 'y';

		ns.minVertexPerOrbit = 50;
		ns.vertexDist = 1/50;//in universe size (so depends on max orbit among all bodies)

		/*var halley = new Date(1986, 1, 9);
		console.log((J2000 - halley)/1000);/**/
		return ns;
	});

})(window.orbit = window.orbit || {});