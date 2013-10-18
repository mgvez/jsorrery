
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/Dimensions',
		'jsorrery/Utils',
		'three'
	], 
	function(ns, $, Dimensions, Utils) {
		'use strict';
		return {
			init : function(name, color){
				this.name = name;
				this.added = false;
				this.color = Utils.rgbToHex(Utils.darken(Utils.hexToRgb(color), 0.75));
			},

			setLine : function(orbitVertices){
				var material = new THREE.LineBasicMaterial({
			        color: this.color
			    });
				_.map(orbitVertices, function(val){ return Dimensions.getScaled(val);});
			    var orbitGeom = new THREE.Geometry();
			    orbitGeom.vertices = orbitVertices;
			    this.line = new THREE.Line(orbitGeom, material);
			},

			getDisplayObject : function(){
				return this.line;
			}

		};


	}

);