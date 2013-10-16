/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Universe',
		'orbit/gui/Gui',
		'orbit/gui/Sharer',
		'orbit/scenario/ScenarioLoader',
		'_'
	], 
	function(ns, $, Universe, Gui, Sharer, ScenarioLoader) {
		'use strict';

		var preloader;

		var activeScenario;
		var loadScenario = function(name, defaultParams) {
			if(activeScenario && name === activeScenario.name) return;

			var scenarioConfig = ScenarioLoader.get(name);

			if(activeScenario) {
				activeScenario.kill();
			}

			activeScenario = Object.create(Universe);
			var onSceneReady = activeScenario.init(scenarioConfig, defaultParams);
			onSceneReady.then(removePreloader);
		};

		var getQueryString = function() {
			var parts = window.location.search.substr(1).split("&");
			var qstr = {};
			var temp;
			for (var i = 0; i < parts.length; i++) {
				temp = parts[i].split("=");
				qstr[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
			}

			if(typeof qstr.cx != 'undefined'){
				qstr.cameraSettings = {
					x : qstr.cx,
					y : qstr.cy,
					z : qstr.cz,
					fov : qstr.fov
				};
				delete(qstr.cx);
				delete(qstr.cy);
				delete(qstr.cz);
				delete(qstr.fov);
			} 

			return qstr;
		};

		var removePreloader = function(){
			preloader.fadeOut(500);
			//console.log(console.memory);
		};

		var Orbit = {
			init : function(){

				preloader = $('#preload');
				Gui.init();


				var defaultParams = _.extend({}, getQueryString());
				Gui.setDefaults(defaultParams);

				var scenarios = ScenarioLoader.getList();
				var scenarioChanger =  Gui.addDropdown(Gui.SCENARIO_ID, function(){
					loadScenario(scenarioChanger.val());
				}.bind(this));

				
				Gui.addBtn('share', Gui.SHARE_ID, function(){
					Sharer.show();
				}.bind(this));
				

				var defaultScenario = 0;		

				_.each(scenarios, function(scenario, idx){
					Gui.addOption(Gui.SCENARIO_ID, scenario.title, scenario.name);
					//find ID of loaded scenario
					if(defaultParams.scenario && scenario.name === defaultParams.scenario) {
						defaultScenario = idx;
					}

				});

				loadScenario(scenarios[defaultScenario].name, defaultParams);

			}
		};
		
		return Orbit;
		
	}
);