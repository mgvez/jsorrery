/*
	Global vars
*/

(function(ns, undefined) {
	define([], 
	function() {
		'use strict';
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

		ns.J2000 = new Date(2000, 0, 1);

		ns.defaultCalculationsPerTick = 200;

		ns.minVertexPerOrbit = 50;
		ns.vertexDist = 1/50;//in universe size (so depends on max orbit among all bodies)

		return ns;
	});

})(window.orbit = window.orbit || {});