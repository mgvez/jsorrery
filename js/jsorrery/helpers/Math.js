
define(
	[
	],
	function(ns, $) {
		'use strict';
		return {
			sinh : function(a) {
				return (Math.exp(a) - Math.exp(-a)) / 2;
			},

			cosh : function(a) {
				return (Math.pow(Math.E, a) + Math.pow(Math.E, -a)) / 2;
			},

			sign : function(a) {
				return (a >= 0.0) ? 1 : -1;
			}
		};
	}
);

