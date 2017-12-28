
import { LineBasicMaterial, Geometry, BufferAttribute, BufferGeometry, Line, Color, Object3D, Vector3, ShaderMaterial, AdditiveBlending, Points } from 'three';
import Promise from 'bluebird';

import Constellations from '../data/Constellations';
import { DEG_TO_RAD } from '../core/constants';
import ResourceLoader from '../loaders/ResourceLoader';

const dataSrc = './assets/data/milkyway_heasarc_204k.json';

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

const pxRatio = (window.devicePixelRatio || 1);


function lightenDarkenColor(hex, amount) {
	let col = [hex >> 16, (hex >> 8) & 0x00FF, hex & 0x0000FF];
	col = col.map(part => {
		const partTrans = part * amount;
		return partTrans < 0 ? 0 : (partTrans > 255 ? 255 : partTrans);
	});
	return (col[0] | (col[1] << 8) | (col[2] << 16));
}


function drawConstellations(rendered) {

	const material = new LineBasicMaterial({
		color: pxRatio === 1 ? 0x222222 : 0x333333
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
			line.frustumCulled = false;
			rendered.add(line);
		});
	});
}

function generateStars(shaders, stars, starTexture, size, rendered) {
	
	const geometry = new BufferGeometry();
	const count = stars.length;

	let star;
	let starVect;
	let mag;
	let name;
	let spectralType;
	let starColor;
	let color;

	const positions = new Float32Array(count * 3);
	const colors = new Float32Array(count * 3);
	const sizes = new Float32Array(count);
	for (let i = 0, i3 = 0; i < count; i++, i3 += 3) {
		star = stars[i];

		starVect = new Vector3(star[X], star[Y], star[Z]);
		if (starVect.x === 0) continue;//dont add the sun
		starVect.normalize().multiplyScalar(size);

		mag = (star[MAG] - MIN_MAG) + 1;
		name = star[NAME];
		spectralType = String(star[SPECT]).toUpperCase();
		starColor = spectralColors[spectralType] || spectralColors[10];
		if (name) namedStars[name] = starVect;

		if (mag < 7) {
			//starVect.size = 2 + Math.pow((2 / starVect.mag), 1.2);
			starColor = lightenDarkenColor(starColor, ((1 / mag) ** 0.3));
		} else {
			//starVect.size = 2;
			// starColor = lightenDarkenColor(starColor, ((1 / mag) ** 0.8));
			starColor = lightenDarkenColor(starColor, ((1 / mag) ** 0.9));
		}			
		/**/

		positions[i3 + 0] = starVect.x;
		positions[i3 + 1] = starVect.y;
		positions[i3 + 2] = starVect.z;

		color = new Color(starColor);
		colors[i3 + 0] = color.r;
		colors[i3 + 1] = color.g;
		colors[i3 + 2] = color.b;

		sizes[i] = pxRatio * (1.5 + Math.floor(10 * (1 / mag)) / 10);

	}

	geometry.addAttribute('position', new BufferAttribute(positions, 3));
	geometry.addAttribute('customColor', new BufferAttribute(colors, 3));
	geometry.addAttribute('size', new BufferAttribute(sizes, 1));

	// console.warn('voir exemple: view-source:https://threejs.org/examples/webgl_buffergeometry_custom_attributes_particles.html');
	const shaderMaterial = new ShaderMaterial({
		uniforms: {
			color: { type: 'c', value: new Color(0xffffff) },
			starTexture: { type: 't', value: starTexture },
		},
		vertexShader: shaders.vertex,
		fragmentShader: shaders.fragment,
		blending: AdditiveBlending,
		transparent: false,
	});

	const particleSystem = new Points(geometry, shaderMaterial);
	
	rendered.add(particleSystem);
	drawConstellations(rendered);

}

export default class MilkyWay {
	
	constructor(size) {
		
		// create the particle system
		this.displayObj = new Object3D();
		//var particleSystem = new Points(particles, pMaterial);
		this.displayObj.rotation.x = -((23 + (26 / 60) + (21 / 3600)) * DEG_TO_RAD);

		const onDataLoaded = ResourceLoader.loadJSON(dataSrc);
		const onShaderLoaded = ResourceLoader.loadShaders('stars');

		const starTextureLoader = ResourceLoader.loadTexture('./assets/img/star.png');
		
		this.onLoaded = Promise.all([onShaderLoaded, onDataLoaded, starTextureLoader]).then(response => {
			const [shaderResponse, dataResponse, textureResponse] = response;
			// console.log(dataResponse);
			generateStars(shaderResponse, dataResponse, textureResponse, size, this.displayObj);
		});
	}

	getDisplayObject() {
		return this.displayObj;
	}

	setPosition(pos) {
		if (this.displayObj) this.displayObj.position.copy(pos);
	}
};
