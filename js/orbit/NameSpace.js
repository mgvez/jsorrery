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
		
		ns.day = 60 * 60 * 24;//duration in seconds
		ns.year = 365.25;//duration in days
		ns.century = 100 * ns.year;//duration in days

		var J2000 = new Date(2000, 0, 1);
		//var startDate = new Date();
		//var startDate = new Date(2012, 6, 1);
		//var startDate = new Date(1986, 1, 9);
		var startDate = new Date(1985, 1, 9);
		//var startDate = J2000;
		ns.TimeEpoch =  ((startDate - J2000) / 1000) ;
		ns.calculatePerturbations = false;

		ns.largestBodyMinimalSize = 0.1;
		ns.smallestBodyMinimalSize = 0.2;

		ns.axisToShowInY = 'y';

		ns.curTime = 0;

		/*var halley = new Date(1986, 1, 9);
		console.log((J2000 - halley)/1000);/**/
		return ns;
	});

})(window.orbit = window.orbit || {});