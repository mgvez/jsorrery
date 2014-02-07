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
		ns.G = 6.6742e-11;
		//astronomical unit in km
		ns.AU = 149597870;
		ns.CIRCLE = 2 * Math.PI;
		ns.KM = 1000;
		ns.DEG_TO_RAD = Math.PI/180;
		ns.RAD_TO_DEG = 180/Math.PI;

		ns.NM_TO_KM = 1.852;
		ns.LB_TO_KG = 0.453592;
		ns.LBF_TO_NEWTON = 4.44822162;
		ns.FT_TO_M = 0.3048;

		//use physics or orbital elements to animate
		ns.USE_PHYSICS_BY_DEFAULT = false;
		
		//duration in seconds
		ns.DAY = 60 * 60 * 24;
		//duration in days
		ns.YEAR = 365.25;
		//duration in days
		ns.CENTURY = 100 * ns.YEAR;
		ns.SIDERAL_DAY = 3600 * 23.9344696;

		ns.J2000 = new Date('2000-01-01T12:00:00-00:00');

		ns.defaultCalculationsPerTick = 10;

		//in universe size (so depends on max orbit among all bodies)
		ns.vertexDist = 1/50;

		return ns;
	});

})(window.jsorrery = window.jsorrery || {});