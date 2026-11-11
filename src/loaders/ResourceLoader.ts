import { TextureLoader, type Texture } from 'three';

/**
 Loads the resources needed by a scenario, so that it can start when they are all ready.
 JSON and shaders are cached across scenarios.
 */

const SHADER_PATH = './assets/shaders/';

export interface Shaders {
	vertex: string;
	fragment: string;
}

const allLoaders: Record<string, Promise<unknown>> = {};
let currentScenarioLoaders: Promise<unknown>[] = [];

function fetchResource(url: string, type: 'json' | 'text') {
	return fetch(url).then(response => {
		if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
		return type === 'json' ? response.json() : response.text();
	});
}

function getCached<T>(id: string): Promise<T> | null {
	const cached = allLoaders[id];
	if (cached === undefined) return null;
	currentScenarioLoaders.push(cached);
	return cached as Promise<T>;
}

export function reset() {
	currentScenarioLoaders = [];
}

/** resolves when all the resources requested since the last reset are loaded */
export function getOnReady() {
	return Promise.all(currentScenarioLoaders).then(() => undefined);
}

export function loadTexture(mapSrc: string) {
	const onLoaded = new TextureLoader().loadAsync(mapSrc);
	currentScenarioLoaders.push(onLoaded);
	return onLoaded;
}

export function loadJSON<T>(dataSrc: string): Promise<T> {
	const cached = getCached<T>(dataSrc);
	if (cached) return cached;

	const onDataLoaded = fetchResource(dataSrc, 'json') as Promise<T>;

	allLoaders[dataSrc] = onDataLoaded;
	currentScenarioLoaders.push(onDataLoaded);
	return onDataLoaded;
}

export function loadShaders(shader: string): Promise<Shaders> {
	const shaderId = `shader.${shader}`;

	const cached = getCached<Shaders>(shaderId);
	if (cached) return cached;

	const finalPromise = Promise.all([
		fetchResource(`${SHADER_PATH}${shader}.vsh`, 'text') as Promise<string>,
		fetchResource(`${SHADER_PATH}${shader}.fsh`, 'text') as Promise<string>,
	]).then(([vertex, fragment]) => ({ vertex, fragment }));

	allLoaders[shaderId] = finalPromise;
	currentScenarioLoaders.push(finalPromise);
	return finalPromise;
}

export type { Texture };
