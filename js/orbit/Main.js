/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Universe',
		'orbit/gui/Gui',
		'orbit/scenario/ScenarioLoader',
		'_'
	], 
	function(ns, $, Universe, Gui, ScenarioLoader) {
		'use strict';

		var activeScenario;
		var loadScenario = function(name, defaultParams) {
			if(activeScenario && name === activeScenario.name) return;

			var scenarioConfig = ScenarioLoader.get(name);

			if(activeScenario) {
				activeScenario.kill();
			}

			activeScenario = Object.create(Universe);
			activeScenario.init(scenarioConfig, defaultParams);

		};

		var getQueryString = function() {
			var parts = window.location.search.substr(1).split("&");
			var qstr = {};
			var temp;
			for (var i = 0; i < parts.length; i++) {
				temp = parts[i].split("=");
				qstr[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
			}
			return qstr;
		};

		var Orbit = {
			init : function(){

				Gui.init();


				var defaultParams = _.extend({}, getQueryString());
				Gui.setDefaults(defaultParams);

				var scenarios = ScenarioLoader.getList();
				var scenarioChanger =  Gui.addDropdown(Gui.SCENARIO_ID, function(){
					loadScenario(scenarioChanger.val());
				}.bind(this));

				
				Gui.addBtn('link', Gui.LINK_ID, function(){
					var exports = Gui.exportValues();
					console.log(exports);
					var obj = JSON.parse(window.atob(exports));
					console.log(obj);
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