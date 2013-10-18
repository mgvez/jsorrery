/*
	Global vars
*/

define([], 
	function() {
		'use strict';
		return {
			hexToRgb : function(hex) {
			    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			    return result ? {
			        r: parseInt(result[1], 16),
			        g: parseInt(result[2], 16),
			        b: parseInt(result[3], 16)
			    } : null;
			},
			rgbToHex : function(rgb) {
				return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
			},
			darken : function(rgb, factor){
				var parsedFactor = 1 - factor;
				return {
					r : rgb.r * parsedFactor,
					g : rgb.g * parsedFactor,
					b : rgb.b * parsedFactor
				};
			}
		};
	}
);
