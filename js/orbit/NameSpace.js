/*
	Global vars
*/

(function(ns, undefined) {
	define([], 
	function() {
		'use strict';
		ns.app = null;
		ns.name = 'orbit';
		ns.version = '2013-09-16';

		//gravitational constant to measure the force with masses in kg and radii in meters N(m/kg)^2
		ns.G = 6.673e-11;
		//astronomical unit in km
		ns.AU = 149597870;
		ns.CIRCLE = 2 * Math.PI;
		ns.KM = 1000;
		ns.DEG_TO_RAD = Math.PI/180;
		ns.RAD_TO_DEG = 180/Math.PI;
		
		//duration in seconds
		ns.DAY = 60 * 60 * 24;
		//duration in days
		ns.YEAR = 365.25;
		//duration in days
		ns.CENTURY = 100 * ns.YEAR;
		ns.SIDERAL_DAY = 3600 * 23.9344696;

		ns.J2000 = new Date(2000, 0, 1);

		ns.defaultCalculationsPerTick = 200;

		//minimal number of points traced per orbit 
		ns.minVerticesChangesPerOrbit = 200;
		//in universe size (so depends on max orbit among all bodies)
		ns.vertexDist = 1/50;

		return ns;
	});

})(window.orbit = window.orbit || {});