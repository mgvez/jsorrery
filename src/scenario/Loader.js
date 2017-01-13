
import solarSystem from './scenarios/SolarSystem';
import innerSolarSystem from './scenarios/InnerSolarSystem';
import apollo from './scenarios/Apollo';
import earthMoon from './scenarios/EarthMoon';
import artificialSatellites from './scenarios/ArtificialSatellites';
import jupiterMoon from './scenarios/JupiterMoon';
// import nearEarthObject from './scenarios/NearEarthObject';
import bigJupiter from './scenarios/BigJupiter';
import moonSOI from './scenarios/MoonSOI';

const all = [
	solarSystem,
	innerSolarSystem,
	apollo,
	earthMoon,
	artificialSatellites,
	jupiterMoon,
	// nearEarthObject,
	bigJupiter,
	moonSOI,
];

const scenarios = all.map(scenario => {
	scenario.bodies = scenario.bodies || {};
	if (scenario.commonBodies) {
		scenario.bodies = scenario.commonBodies.reduce((carry, current) => {
			const { name } = current;
			carry[name] = Object.assign({}, current, scenario.bodies[name]);
			// console.log(name);
			return carry;
		}, scenario.bodies);
	}
	scenario.title = scenario.title || scenario.name;
	scenario.help = scenario.help || '';
	return scenario;
});


export default {
	get(which) {
		return scenarios.find(scenario => scenario.name === which);
	},
	getList() {
		return scenarios;
	},
};
