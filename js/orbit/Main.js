/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Universe'
	], 
	function(ns, $, Universe) {
		'use strict';
		
		var Orbit = {
			init : function(){
				Universe.init()
			}
		};
		
		return Orbit;
		
	}
);