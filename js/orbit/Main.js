/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Universe'
	], 
	function(ns, $, Universe) {

		
		var Orbit = {
			init : function(){
				Universe.init()
			}
		};
		
		return Orbit;
		
	}
);