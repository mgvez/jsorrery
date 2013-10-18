/**
Source : http://threejs.org/examples/webgl_lensflares.html
*/

define(
	[
		'orbit/NameSpace',
		'orbit/graphics3d/loaders/ResourceLoader'
	], 
	function(ns, ResourceLoader){
		'use strict';

var printed;
		var lensFlareUpdateCallback = function( object ) {
			var f, fl = object.lensFlares.length;
			var flare;
			var vecX = -object.positionScreen.x * 2;
			var vecY = -object.positionScreen.y * 2;

			for( f = 0; f < fl; f++ ) {
				   flare = this.lensFlares[ f ];

					flare.x = this.positionScreen.x + vecX * flare.distance;
					flare.y = this.positionScreen.y + vecY * flare.distance;

					flare.wantedRotation = flare.x * Math.PI * 0.25;
					flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.25;
			}

		};

		var Sun = {
			mapSrc : 'img/lensflare0.png',
			init : function(size){
				this.root = new THREE.Object3D();
				var flareTx = ResourceLoader.loadTexture(this.mapSrc);
				var flareColor = new THREE.Color( 0xffffff );
				flareColor.setHSL( 0.57, 0.80, 0.97 );

				var sunFlare = new THREE.LensFlare( flareTx, 100, 0, THREE.AdditiveBlending, flareColor );

				sunFlare.customUpdateCallback = lensFlareUpdateCallback;
				this.root.add(sunFlare);
			},

			setLight : function(hasCelestial) {
				var light;
				if(hasCelestial) {
					//if the sun is a celestial body part of the scene
					light = new THREE.PointLight(0xFFFFFF);
					
				} else {
					//the sun is not part of the scene. We need to mimick it.
					light = new THREE.DirectionalLight(0xFFFFFF, 1);
					
				}
				this.root.add(light);

			},

			getDisplayObject : function(){
				return this.root;
			},

			setPosition : function(pos){
				this.root.position.copy(pos);
			}
		};

		return Sun;
	}
);