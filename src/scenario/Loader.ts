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
import type { BodyDefinition, Scenario, ScenarioDefinition } from './types';

const all: ScenarioDefinition[] = [
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

/** merges the common bodies (shared definitions of the planets) with the scenario specific bodies */
export function buildScenario(scenario: ScenarioDefinition): Scenario {
	const bodies = (scenario.bodies || {}) as Record<string, BodyDefinition>;
	scenario.bodies = bodies;
	if (scenario.commonBodies) {
		scenario.bodies = scenario.commonBodies.reduce((carry, current) => {
			const name = current.name!;
			carry[name] = {
				...current,
				...bodies[name],
			};
			carry[name].orbit = carry[name].orbit && JSON.parse(JSON.stringify(carry[name].orbit));
			return carry;
		}, bodies);
		scenario.commonBodies = null;
	}
	scenario.title = scenario.title || scenario.name;
	scenario.help = scenario.help || '';
	return scenario as Scenario;
}

let built: Scenario[] | undefined;
function getAll() {
	return built = built || all.map(buildScenario);
}

export function getScenario(which: string) {
	return getAll().find(scenario => scenario.name === which);
}

export function getScenarioList() {
	return getAll();
}
