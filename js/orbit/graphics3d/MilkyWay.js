define(
	[
		'orbit/NameSpace',
		'jquery'
	], 
	function(ns, $){
		'use strict';

		var MilkyWay = {
			mapSrc : 'img/milkyway.jpg',
			init : function(size){
				var matOptions = {
					map : THREE.ImageUtils.loadTexture(this.mapSrc),
					side: THREE.BackSide
				};

				var mat = new THREE.MeshBasicMaterial(matOptions);

				var radius = size;
				var segments = 50;
				var rings = 50;
				var sphere = new THREE.Mesh(
					new THREE.SphereGeometry(radius, segments, rings),
					mat
				);

				var displayObj =  this.displayObj = new THREE.Object3D();
				
				displayObj.add(sphere);
				//milkyway.rotation.y = -(Math.PI / 2) - ((23+(26/60)+(21/3600)) * ns.DEG_TO_RAD) ;
				displayObj.rotation.x = (Math.PI / 2) - ((23+(26/60)+(21/3600)) * ns.DEG_TO_RAD);
			},

			getDisplayObject : function(){
				return this.displayObj;
			},

			setPosition : function(pos){
				this.displayObj.position.copy(pos);
			}
		};

		return MilkyWay;
	}
);