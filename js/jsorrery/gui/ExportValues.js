
define(
	[
	],
	function(){
		'use strict';
		var vals = {};
		var cam;

		return {
			reset : function(){
				vals = {};
			},

			setVal : function(k, v){
				vals[k] = v;
			},

			setCamera : function(camera){
				cam = camera;
			},

			getExport : function() {
				return $.extend(vals, {cx:cam.position.x, cy:cam.position.y, cz:cam.position.z, fov:cam.fov});
			}

		};
	}
);