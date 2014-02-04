
define(
	[
		'jsorrery/NameSpace',
		'jsorrery/graphics3d/Dimensions'
	], 
	function(ns, Dim){
		'use strict';

		
		var Point = {

			setPosition : function(pos){
				this.displayObj.position.copy(Dim.getScaled(pos.clone()));
			},

			addVector : function(v, color) {
				var arrow = new THREE.ArrowHelper( v.clone().normalize(), new THREE.Vector3(0,0,0), v.length()/10, color || 0xff0000 );
				this.displayObj.add(arrow);
			}
		};

		return {

			getNew : function(pos, color){

				var displayObj = new THREE.Object3D();

				var mat = new THREE.MeshLambertMaterial({
					color : color || 0xffffff
				});

				var radius = 0.01;
				var segments = 12;
				var rings = 12;
				var dot = new THREE.Mesh(
					new THREE.SphereGeometry(radius, segments, rings),
					mat
				);


				var sc = ns.U.scene.root;

				displayObj.add(dot);
				sc.add(displayObj);

				var point = Object.create(Point);
				point.displayObj = displayObj;

				point.setPosition(pos);
				return point;

			}

		};
	}
);