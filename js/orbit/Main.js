/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/Universe',
		'orbit/gui/Gui',
		'orbit/scenario/ScenarioLoader'
	], 
	function(ns, $, Universe, Gui, ScenarioLoader) {
		'use strict';

		var activeScenario;
		var loadScenario = function(name) {

			var scenarioConfig = ScenarioLoader.get(name);

			if(activeScenario) {
				activeScenario.kill();
			}


			activeScenario = Object.create(Universe);
			activeScenario.init(scenarioConfig);

		};

		var Orbit = {
			init : function(){

				Gui.init();


				var scenarios = ScenarioLoader.getList();
				var scenarioChanger =  Gui.addDropdown('scenario', function(){
					loadScenario(scenarioChanger.val());
				}.bind(this));
				
				_.each(scenarios, function(scenario){
					Gui.addOption('scenario', scenario.title, scenario.name);
				});


				loadScenario(scenarios[0].name);

			}
		};
		
		return Orbit;
		
	}
);