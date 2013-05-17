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
		
		ns.day = 60 * 60 * 24;//duration in seconds
		ns.year = 365.25;//duration in days
		ns.century = 100 * ns.year;//duration in days

		var J2000 = new Date(2000, 0, 1);
		var today = new Date();
		ns.TimeEpoch = (today - J2000) / 1000 ;// -3543;//seconds since 2000-01-01 (J2000)
		ns.calculatePerturbations = false;

		ns.axisToShowInY = 'y';

		return ns;
	});

})(window.orbit = window.orbit || {});