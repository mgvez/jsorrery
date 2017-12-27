
import { TextureLoader } from 'three';

import $ from 'jquery';
import Promise from 'bluebird';

const SHADER_PATH = './assets/shaders/';
const SHADER_TYPES = [
	{
		ext: 'vsh',
		type: 'vertex',
	},
	{
		ext: 'fsh',
		type: 'fragment',
	},
];

const allLoaders = {};
let currentScenarioLoaders;

function getCached(id) {
	if (allLoaders[id]) {
		currentScenarioLoaders.push(allLoaders[id]);
		return allLoaders[id];
	}
	return null;
}

export default {
	
	reset() {
		currentScenarioLoaders = [];
	},

	getOnReady() {
		return Promise.all(currentScenarioLoaders);
	},

	loadTexture(mapSrc) {
		
		const onLoaded = new Promise(resolve => {
			const loader = new TextureLoader();
			loader.load(mapSrc, (tx) => {
				resolve(tx);
			});
		});
		currentScenarioLoaders.push(onLoaded);
		return onLoaded;

	},

	loadJSON(dataSrc) {

		let onDataLoaded = getCached(dataSrc);
		if (onDataLoaded) return onDataLoaded;

		onDataLoaded = $.ajax({
			url: dataSrc,
			dataType: 'json',
		});

		allLoaders[dataSrc] = onDataLoaded;
		currentScenarioLoaders.push(onDataLoaded);
		return onDataLoaded;
	},

	loadShaders(shader) {
		const shaderId = `shader.${shader}`;

		const shaderDfd = getCached(shaderId);
		if (shaderDfd) return shaderDfd;

		const dfds = SHADER_TYPES.map(shaderType => {
			const { ext } = shaderType;
			return $.ajax({
				url: `${SHADER_PATH}${shader}.${ext}`,
				dataType: 'text',
			});
		});


		const finalDfd = Promise.all(dfds).then((shaders) => {
			const [vsh, fsh] = shaders;
			// console.log(vsh);
			// console.log(fsh);
			return {
				vertex: vsh,
				fragment: fsh,
			};
		});

		allLoaders[shaderId] = finalDfd;
		currentScenarioLoaders.push(finalDfd);
		return finalDfd;

	},
};
