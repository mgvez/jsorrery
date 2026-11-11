/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

import { AU }from '../../core/constants';
import { moon } from './bodies/moon';
import { sun } from './bodies/sun';
import { mercury } from './bodies/mercury';
import { venus } from './bodies/venus';
import { earth } from './bodies/earth';
import { mars } from './bodies/mars';


const baseNEO = {
	mass: 1,
	radius: 2000,
	color: '#ffffff',
};

const N_TO_SHOW = 10;
const MIN_DIST = 0.1;

function fetchJSON(url) {
	return fetch(url).then(response => {
		if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
		return response.json();
	});
}

function onLoadError(error) {
	alert('Error loading NEO definitions. See console.');// eslint-disable-line
	console.log(error);// eslint-disable-line
	throw error;
}

function onListLoaded(res) {
	// console.log(res);
	if (res.near_earth_objects) {
		const allLinks = Object.keys(res.near_earth_objects).reduce((neoLinks, day) => {
			const dayNeos = res.near_earth_objects[day];
			return neoLinks.concat(dayNeos.map((neoDef) => {
				const { close_approach_data } = neoDef;
				const missData = close_approach_data && close_approach_data[0];
				const missDist = missData && Number(missData.miss_distance.astronomical);
				// console.log(neoDef.name);
				if (missDist && missDist < MIN_DIST) {
					return {
						dist: missDist,
						url: neoDef.links && neoDef.links.self,
					};
				}
				return null;
			}).filter(a => a).sort((a, b) => a.dist - b.dist));
		}, []);
		// console.log(allLinks.length);
		allLinks.length = allLinks.length > N_TO_SHOW ? N_TO_SHOW : allLinks.length;
		// console.log(allLinks);
		
		const allLoaded = allLinks.map(loadNeo);
		return Promise.all(allLoaded).then((allNeo) => {
			// console.log(allNeo);
			
			return allNeo.reduce((neos, neo) => {
				// console.log(neo);
				neos[neo.name] = neo;
				return neos;
			}, {});
		});
	}
	return Promise.reject();
}

function loadNeo(neoData) {
	// console.log('load ', neoData.url);
	return fetchJSON(neoData.url).then(onObjectLoaded);
}

function onObjectLoaded(res) {
	// console.log(res);
	const { name, orbital_data } = res;
	
	return Object.assign({
		name,
		title: name,
		orbit: {
			epoch: Number(orbital_data.epoch_osculation),
			base: {
				a: Number(orbital_data.semi_major_axis) * AU,
				e: Number(orbital_data.eccentricity),
				w: Number(orbital_data.perihelion_argument),
				M: Number(orbital_data.mean_anomaly),
				i: Number(orbital_data.inclination),
				o: Number(orbital_data.ascending_node_longitude),
			},
			day: {
				M: 360 / Number(orbital_data.orbital_period),
			},
		},
	}, baseNEO);
}

let scenarioReady;
const cnf = {
	name: 'NEO',
	title: 'Near Earth Objects',
	load: () => {
		if (scenarioReady) return scenarioReady;

		const feedDate = (new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).toISOString().substring(0, 10);
		scenarioReady = fetchJSON(`https://mvezina.com/jsorrery/feed-${feedDate}`).then(onListLoaded).catch(onLoadError).then(neos => {
			// console.log(neos);
			cnf.bodies = Object.assign(cnf.bodies, neos);
		});

		return scenarioReady;
	},
	commonBodies: [
		sun,
		mercury,
		venus,
		earth,
		moon,
		mars,
	],
	secondsPerTick: { min: 60, max: 3600 * 5, initial: 3600 },
	defaultGuiSettings: { 
		planetScale: 1,
	},
	help: `This scenario shows the next ${N_TO_SHOW} passages closer than ${MIN_DIST} AU of near Earth objects from Nasa's Near Earth Object Project (<a href="http://neo.jpl.nasa.gov/" target="_blank">http://neo.jpl.nasa.gov/</a>.`,
};

export default cnf;
