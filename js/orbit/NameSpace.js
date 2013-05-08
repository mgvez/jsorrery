/*
	Global vars
*/

(function(ns, undefined) {
	define([], 
	function() {

		
		
		ns.app = null;
		ns.name = 'orbit';
		ns.version = '0.0.1';


		ns.G = 6.673e-11;//gravitational constant to measure the force with masses in kg and radii in meters N(m/kg)^2
		ns.AU = 149597870;//astronomical unit in km
		
		return ns;
	});

})(window.orbit = window.orbit || {});