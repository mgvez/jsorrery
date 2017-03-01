/**
Source : http://threejs.org/examples/webgl_lensflares.html
*/

import { Object3D, Color, LensFlare, AdditiveBlending, PointLight, DirectionalLight } from 'three';
import ResourceLoader from '../loaders/ResourceLoader';

export default {
	flareMapSrc: '/img/sunflare.png',
	init(size) {
		this.root = new Object3D();
		const flareTx = ResourceLoader.loadTexture(this.flareMapSrc).then(tx => {
			const flareColor = new Color(0xffffff);
			flareColor.setHSL(0.57, 0.80, 0.97);

			const flareParams = this.flareParams = { size: 400 };
			this.sunFlare = new LensFlare(tx, this.flareParams.size, 0.0, AdditiveBlending, flareColor);

			function lensFlareUpdateCallback(object) {
				let f;
				const fl = object.lensFlares.length;
				let flare;
				const vecX = -object.positionScreen.x * 2;
				const vecY = -object.positionScreen.y * 2;

				for (f = 0; f < fl; f++) {
					flare = this.lensFlares[f];
					flare.x = this.positionScreen.x + vecX * flare.distance;
					flare.y = this.positionScreen.y + vecY * flare.distance;
					flare.size = flareParams.size;
					// console.log(flare.size);
					flare.wantedRotation = flare.x * Math.PI * 0.5;
					flare.rotation += (flare.wantedRotation - flare.rotation) * 0.5;
				}
			}

			this.sunFlare.customUpdateCallback = lensFlareUpdateCallback;

			this.root.add(this.sunFlare);
		});
	},

	setLight(hasCelestial) {
		let light;
		if (hasCelestial) {
			//if the sun is a celestial body part of the scene
			light = new PointLight(0xFFFFFF);
		} else {
			//the sun is not part of the scene. We need to mimick it.
			light = new DirectionalLight(0xFFFFFF, 1);
		}
		this.root.add(light);

	},

	getDisplayObject() {
		return this.root;
	},

	setPosition(pos) {
		this.root.position.copy(pos);
	},

	setFlarePosition(pos) {
		this.sunFlare.position.copy(pos);
	},

	setFlareSize(sunSizeRatio, screenH) {
		//console.log(sunSizeRatio);
		this.flareParams.size = sunSizeRatio * screenH * 20;
	},
};
