 /**
 //THREE.js does not render right when distances are too large, as for example if the unit in three.js corresponded to one meter in the solar system
 */

define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	], 
	function(ns, $) {
		'use strict';

		var Dimensions = {
			
			scale : 1,

			setLargestDimension : function(dim) {
				this.scale =  1000 / dim;
			},

			getScaled : function(obj) {
				//
				if(obj instanceof THREE.Vector3) {
					return obj.multiplyScalar(this.scale);
				} 
				return obj * this.scale;
			}
			
		};

		return Dimensions;

	});
