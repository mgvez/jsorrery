/**
Source : http://threejs.org/examples/webgl_lensflares.html
*/

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/graphics3d/loaders/ResourceLoader'
	], 
	function(ns, ResourceLoader){
		'use strict';

		var Sun = {
			flareMapSrc : 'img/sunflare.png',
			init : function(size){
				this.root = new THREE.Object3D();
				var flareTx = ResourceLoader.loadTexture(this.flareMapSrc);
				var flareColor = new THREE.Color( 0xffffff );
				flareColor.setHSL( 0.57, 0.80, 0.97 );

				var flareParams = this.flareParams = {size : 400};
				this.sunFlare = new THREE.LensFlare( flareTx, this.flareParams.size, 0.0, THREE.AdditiveBlending, flareColor );

				var lensFlareUpdateCallback = function( object ) {
					var f, fl = object.lensFlares.length;
					var flare;
					var vecX = -object.positionScreen.x * 2;
					var vecY = -object.positionScreen.y * 2;

					for( f = 0; f < fl; f++ ) {
						flare = this.lensFlares[ f ];
						flare.x = this.positionScreen.x + vecX * flare.distance;
						flare.y = this.positionScreen.y + vecY * flare.distance;
						flare.size = flareParams.size;
						//console.log(flare.size);
						flare.wantedRotation = flare.x * Math.PI * 0.5 ;
						flare.rotation += ( flare.wantedRotation - flare.rotation ) * 0.5;
					}
				};

				this.sunFlare.customUpdateCallback = lensFlareUpdateCallback;

				this.root.add(this.sunFlare);
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
			},

			setFlarePosition : function(pos){
				this.sunFlare.position.copy(pos);
			},

			setFlareSize : function(sunSizeRatio, screenH){
				//console.log(sunSizeRatio);
				this.flareParams.size = sunSizeRatio * screenH * 20;
			}
		};

		return Sun;
	}
);