/**

mass : kg
dist : km
apeed : km/s
radius: km

*/

import { AU } from '../../core/constants';
import { moon } from './bodies/moon';
import { sun } from './bodies/sun';
import { mercury } from './bodies/mercury';
import { venus } from './bodies/venus';
import { earth } from './bodies/earth';
import { mars } from './bodies/mars';
import type { BodyDefinition, ScenarioDefinition } from '../types';

/** subset of the responses of Nasa's NeoWs API (https://api.nasa.gov) */
interface NeoFeed {
	near_earth_objects?: Record<string, {
		links?: { self?: string };
		close_approach_data?: { miss_distance: { astronomical: string } }[];
	}[]>;
}

interface NeoObject {
	name: string;
	orbital_data: Record<string, string>;
}

interface NeoLink {
	dist: number;
	url: string;
}

const baseNEO = {
	mass: 1,
	radius: 2000,
	color: '#ffffff',
};

const N_TO_SHOW = 10;
const MIN_DIST = 0.1;

//the feed is fetched through a proxy that caches Nasa's API responses
const FEED_URL = 'https://mvezina.com/jsorrery/feed-';

function fetchJSON<T>(url: string): Promise<T> {
	return fetch(url).then(response => {
		if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
		return response.json() as Promise<T>;
	});
}

function onListLoaded(res: NeoFeed) {
	const feed = res.near_earth_objects;
	if (!feed) return Promise.reject(new Error('Invalid near earth objects feed'));

	const allLinks = Object.keys(feed).reduce<NeoLink[]>((neoLinks, day) => {
		const dayNeos = feed[day];
		return neoLinks.concat(dayNeos.map((neoDef) => {
			const { close_approach_data } = neoDef;
			const missData = close_approach_data && close_approach_data[0];
			const missDist = missData && Number(missData.miss_distance.astronomical);
			if (missDist && missDist < MIN_DIST && neoDef.links && neoDef.links.self) {
				return {
					dist: missDist,
					url: neoDef.links.self,
				};
			}
			return null;
		}).filter((a): a is NeoLink => !!a).sort((a, b) => a.dist - b.dist));
	}, []);
	allLinks.length = allLinks.length > N_TO_SHOW ? N_TO_SHOW : allLinks.length;

	return Promise.all(allLinks.map(loadNeo)).then((allNeo) => {
		return allNeo.reduce<Record<string, BodyDefinition>>((neos, neo) => {
			neos[neo.name!] = neo;
			return neos;
		}, {});
	});
}

function loadNeo(neoData: NeoLink) {
	return fetchJSON<NeoObject>(neoData.url).then(onObjectLoaded);
}

function onObjectLoaded(res: NeoObject): BodyDefinition {
	const { name, orbital_data } = res;

	return {
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
		...baseNEO,
	};
}

let scenarioReady: Promise<void> | null = null;
const cnf: ScenarioDefinition = {
	name: 'NEO',
	title: 'Near Earth Objects',
	load: () => {
		if (scenarioReady) return scenarioReady;

		const feedDate = (new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).toISOString().substring(0, 10);
		scenarioReady = fetchJSON<NeoFeed>(`${FEED_URL}${feedDate}`).then(onListLoaded).then(neos => {
			cnf.bodies = Object.assign(cnf.bodies || {}, neos);
		}).catch((error: unknown) => {
			//allow a new attempt
			scenarioReady = null;
			throw new Error('Error loading near earth objects definitions', { cause: error });
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
