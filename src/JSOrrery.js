
import $ from 'jquery';
import Gui, { SCENARIO_ID, SHARE_ID } from './gui/Gui';
import Sharer from './gui/Sharer';
import Universe from './Universe';
import Preloader from './gui/Preloader';
import ScenarioLoader from './scenario/Loader';

function getInitialSettings() {
	const parts = window.location.search.substr(1).split('&');
	const qstr = parts.reduce((carry, part) => {
		const pair = part.split('=');
		carry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		return carry;
	}, (window.jsOrrery && window.jsOrrery.defaults) || {});

	if (typeof qstr.cx !== 'undefined') {
		qstr.cameraSettings = {
			x: qstr.cx,
			y: qstr.cy,
			z: qstr.cz,
			fov: qstr.fov,
		};
	} 

	return qstr;
}

let activeScenario;
function loadScenarioFromName(name, defaultParams) {
	if (activeScenario && name === activeScenario.name) {
		Preloader.remove();
		return;
	}
	const scenarioConfig = ScenarioLoader.get(name);
	loadScenario(scenarioConfig, defaultParams);
}

export function loadScenario(scenarioConfig, defaultParams) {

	if (activeScenario) {
		activeScenario.kill();
	}
	if (!scenarioConfig) return Promise.resolve(null);
	activeScenario = Object.create(Universe);
	// console.log(activeScenario);
	function getSceneReady() {
		return activeScenario.init(scenarioConfig, defaultParams);
	}

	//some scenarios need to load data before they are ready
	let onSceneReady;
	if (scenarioConfig.load) {
		onSceneReady = scenarioConfig.load();
		onSceneReady.then(getSceneReady);
	} else {
		onSceneReady = getSceneReady();
	}
	return onSceneReady.then(() => Preloader.remove()).catch((e) => {
		console.log(e);	// eslint-disable-line
	}).then(() => {
		return activeScenario;
	});
}

export default function jsOrrery() {

	Preloader.remove();
	Gui.init();

	const defaultParams = Object.assign({}, getInitialSettings());
	Gui.setDefaults(defaultParams);

	const scenarios = ScenarioLoader.getList();
	const scenarioChanger = Gui.addDropdown(SCENARIO_ID, () => {
		Preloader.show();
		loadScenarioFromName(scenarioChanger.getValue());
	});
	
	Gui.addBtn(SHARE_ID, SHARE_ID, () => {
		Sharer.show();
	});
	
	//dump scenarios specific descriptions in the scenario help panel
	const help = scenarios.reduce((carry, scenario) => {
		return `${carry} <h3>${scenario.title}</h3><p>${scenario.help}</p>`;
	}, '');

	const defaultScenario = scenarios.reduce((carry, scenario, idx) => {
		//find ID of loaded scenario
		if (defaultParams.scenario && scenario.name === defaultParams.scenario) {
			return idx;
		}
		return carry;
	}, 0);	

	//add scenarios to dropdown
	scenarios.forEach((scenario, idx) => {
		scenarioChanger.addOption(scenario.title, scenario.name, idx === defaultScenario);
	});

	const scenarioHelpContainer = $('#helpScenario');
	scenarioHelpContainer.append(help);

	loadScenarioFromName(scenarios[defaultScenario].name, defaultParams);
}
