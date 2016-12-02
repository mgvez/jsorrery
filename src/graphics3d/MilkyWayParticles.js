// define(
// 	[
// 		'jsorrery/NameSpace',
// 		'jquery',
// 		'jsorrery/data/Constellations',
// 		'jsorrery/graphics3d/loaders/ResourceLoader',
// 		'_'
// 	], 
// 	function(ns, $, Constellations, ResourceLoader){


// 		'use strict';

import { LineBasicMaterial, Geometry, Line, Color, Object3D, Vector3, ShaderMaterial, AdditiveBlending, ParticleSystem } from 'three';
import Promise from 'bluebird';

import Constellations from '../data/Constellations';
import { DEG_TO_RAD } from '../constants';
import ResourceLoader from '../loaders/ResourceLoader';

let rendered;

const pxRatio = (window.devicePixelRatio || 1);

//keys of the loaded array
const NAME = 0;
const X = 1;
const Y = 2;
const Z = 3;
const MAG = 4;
const SPECT = 5;

const MIN_MAG = -1.44;

const spectralColors = [
	0xfbf8ff,
	0xc8d5ff,
	0xd8e2ff,
	0xe6ecfc,
	0xfbf8ff,
	0xfff4e8,
	0xffeeda,
	0xfeead3,
	0xfccecb,
	0xebd3da,
	0xe7dbf3,
];

const namedStars = {};

let starTexture;

function lightenDarkenColor(hex, amount) {
	let col = [hex >> 16, (hex >> 8) & 0x00FF, hex & 0x0000FF];
	col = col.map(part => {
		const partTrans = part * amount;
		return partTrans < 0 ? 0 : (partTrans > 255 ? 255 : partTrans);
	});
	return (col[0] | (col[1] << 8) | (col[2] << 16));
}


function drawConstellations() {

	const material = new LineBasicMaterial({
		color: pxRatio === 1 ? 0x111111 : 0x222222,
	});

	Object.keys(Constellations).forEach(fromName => {
		const toArr = Constellations[fromName];
		const fromPoint = namedStars[fromName];

		toArr.forEach(toName => {
			const toPoint = namedStars[toName];
			if (!toPoint || !fromPoint) return;
			
			const orbitGeom = new Geometry();
			orbitGeom.vertices = [fromPoint, toPoint];
			const line = new Line(orbitGeom, material);
			rendered.add(line);
		});
	});
}

function getShaderAttr() {
	return {
		uniforms: {
			color: { type: 'c', value: new Color(0xffffff) },
			starTexture: { type: 't', value: starTexture },
		},

		attributes: {
			size: { type: 'f', value: [] },
			customColor: { type: 'c', value: [] },
		},
	};
}

function generateStars(shaders, stars, size) {
	
	const shaderAttr = getShaderAttr();

	const pGeo = new Geometry();
	const count = stars.length;

	let star;
	let starVect;
	let mag;
	let name;
	let spectralType;
	let starColor;

	for (let i = 0; i < count; i++) {
		star = stars[i];

		starVect = new Vector3(star[X], star[Y], star[Z]);
		if (starVect.x === 0) continue;//dont add the sun
		starVect.normalize().multiplyScalar(size);

		mag = starVect.mag = (star[MAG] - MIN_MAG) + 1;
		name = star[NAME];
		spectralType = String(star[SPECT]).toUpperCase();
		starColor = spectralColors[spectralType] || spectralColors.F;

		if (name) namedStars[name] = starVect;

		if (starVect.mag < 7) {
			//starVect.size = 2 + Math.pow((2 / starVect.mag), 1.2);
			starColor = lightenDarkenColor(starColor, Math.pow(1 / starVect.mag, 0.5));
		} else {
			//starVect.size = 2;
			starColor = lightenDarkenColor(starColor, Math.pow(1 / starVect.mag, 1.1));
		}			
		/**/
		starVect.size = pxRatio * Math.floor(10 * (2 + (1 / mag))) / 10;
		//starColor = lightenDarkenColor(starColor, Math.pow(1.5/mag, 1.1));

		pGeo.vertices.push(starVect);
		pGeo.colors.push(new Color(starColor));
	}

	const shaderMaterial = new ShaderMaterial({
		uniforms: shaderAttr.uniforms,
		attributes: shaderAttr.attributes,
		vertexShader: shaders.vertex,
		fragmentShader: shaders.fragment,
		blending: AdditiveBlending,
		transparent:	true,
	});

	const particleSystem = new ParticleSystem(pGeo, shaderMaterial);
	
	//	set the values to the shader
	const values_size = shaderAttr.attributes.size.value;
	const values_color = shaderAttr.attributes.customColor.value;

	for (let v = 0; v < pGeo.vertices.length; v++) {
		values_size[v] = pGeo.vertices[v].size;
		values_color[v] = pGeo.colors[v];
	}

	rendered.add(particleSystem);
	drawConstellations();
}

export default {
	dataSrc: 'js/jsorrery/data/milkyway.json',
	//dataSrc : 'js/jsorrery/data/milkyway_heasarc_468k.json',
	init(size) {
		
		// create the particle system
		rendered = this.displayObj = new Object3D();
		//var particleSystem = new THREE.ParticleSystem(particles, pMaterial);
		rendered.rotation.x = -((23 + (26 / 60) + (21 / 3600)) * DEG_TO_RAD);

		const onDataLoaded = ResourceLoader.loadJSON(this.dataSrc);
		const onShaderLoaded = ResourceLoader.loadShaders('stars');

		starTexture = ResourceLoader.loadTexture('img/star.png');
		
		return Promise.all([onShaderLoaded, onDataLoaded]).then((shaderResponse, dataResponse) => {
			generateStars(shaderResponse, dataResponse[0], size);
		});
	},

	getDisplayObject() {
		return this.displayObj;
	},

	setPosition(pos) {
		if (this.displayObj) this.displayObj.position.copy(pos);
	},
};
