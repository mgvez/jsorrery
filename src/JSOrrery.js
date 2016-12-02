
// 		'jsorrery/Universe',
import $ from 'jquery';
import Gui, { SCENARIO_ID, SHARE_ID } from './gui/Gui';
import Sharer from './gui/Sharer';
import Universe from './Universe';
import Preloader from './gui/Preloader';
import ScenarioLoader from './scenario/Loader';

function getQueryString() {
	const parts = window.location.search.substr(1).split('&');
	const qstr = parts.reduce((carry, part) => {
		const pair = part.split('=');
		carry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
		return carry;
	}, {});

	if (typeof qstr.cx !== 'undefined') {
		qstr.cameraSettings = {
			x: qstr.cx,
			y: qstr.cy,
			z: qstr.cz,
			fov: qstr.fov,
		};
		delete qstr.cx;
		delete qstr.cy;
		delete qstr.cz;
		delete qstr.fov;
	} 

	return qstr;
}

let activeScenario;
function loadScenario(name, defaultParams) {
	if (activeScenario && name === activeScenario.name) {
		Preloader.remove();
		return;
	}

	const scenarioConfig = ScenarioLoader.get(name);

	if (activeScenario) {
		activeScenario.kill();
	}

	activeScenario = Object.create(Universe);

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
	onSceneReady.then(Preloader.remove);
}

export default {
	init() {
		console.log('inited');
		Preloader.remove();
		Gui.init();

		const defaultParams = Object.assign({}, getQueryString());
		Gui.setDefaults(defaultParams);

		const scenarios = ScenarioLoader.getList();
		const scenarioChanger = Gui.addDropdown(SCENARIO_ID, () => {
			Preloader.show();
			loadScenario(scenarioChanger.val());
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
			Gui.addOption(SCENARIO_ID, scenario.title, scenario.name, idx === defaultScenario);
		});

		const scenarioHelpContainer = $('#helpScenario');
		scenarioHelpContainer.append(help);

		loadScenario(scenarios[defaultScenario].name, defaultParams);
	},
};
