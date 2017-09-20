
import solarSystem from './scenarios/SolarSystem';
import solarSystemDwarves from './scenarios/SolarSystemDwarves';
import innerSolarSystem from './scenarios/InnerSolarSystem';
import apollo from './scenarios/Apollo';
import earthMoon from './scenarios/EarthMoon';
import artificialSatellites from './scenarios/ArtificialSatellites';
import jupiterMoon from './scenarios/JupiterMoon';
import nearEarthObject from './scenarios/NearEarthObject';
import bigJupiter from './scenarios/BigJupiter';
import moonSOI from './scenarios/MoonSOI';

const all = [
	solarSystem,
	solarSystemDwarves,
	innerSolarSystem,
	apollo,
	earthMoon,
	artificialSatellites,
	jupiterMoon,
	nearEarthObject,
	bigJupiter,
	moonSOI,
];

export function buildScenario(scenario) {
	scenario.bodies = scenario.bodies || {};
	if (scenario.commonBodies) {
		scenario.bodies = scenario.commonBodies.reduce((carry, current) => {
			const { name } = current;
			carry[name] = {
				...current,
				...scenario.bodies[name],
			};
			carry[name].orbit = carry[name].orbit && JSON.parse(JSON.stringify(carry[name].orbit));
			return carry;
		}, scenario.bodies);
		scenario.commonBodies = null;
	}
	scenario.title = scenario.title || scenario.name;
	scenario.help = scenario.help || '';
	return scenario;
}

let built;
function getAll() {
	return built = built || all.map(buildScenario);
}

export default {
	get(which) {
		return getAll().find(scenario => scenario.name === which);
	},
	getList() {
		return getAll();
	},
};
