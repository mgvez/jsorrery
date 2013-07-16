/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/CelestialBody',
		'orbit/algorithm/GravityTicker',
		'orbit/graphics3d/Scene',
		'orbit/gui/Gui',
		'orbit/scenario/ScenarioLoader',
		'_'
	], 
	function(ns, $, CelestialBody, GravityTicker, Scene, Gui, ScenarioLoader) {

		var Universe = {
			init : function(){

				ns.U = this;
				
				Gui.init();
				Gui.addBtn('start/stop', 'start', function(){
					this.playing = !this.playing;
				}.bind(this));

				this.dateDisplay = Gui.addText();

				var scenarios = ScenarioLoader.getList();
				var scenarioChanger =  Gui.addDropdown('scenario', 'Scenario', function(){
					this.loadScenario(scenarioChanger.val());
				}.bind(this));
				_.each(scenarios, function(scenario){
					Gui.addOption('scenario', scenario.title, scenario.name);
				});
				
				this.loadScenario(scenarios[0].name);
				this.tick();
			},

			loadScenario : function(name){
				this.killScenario();
				this.playing = false;
				this.epochTime = 0;
				this.currentTime = ns.startEpochTime;
				this.date = new Date();
				var scenario = ScenarioLoader.get(name);
				//var scenario = ScenarioLoader.get('SolarSystem');
				//var scenario = ScenarioLoader.get('SaturnMoon');
				//var scenario = ScenarioLoader.get('InnerSolarSystem');
				//var scenario = ScenarioLoader.get('Artificial');
				//var scenario = ScenarioLoader.get('JupiterMoon');
				this.createBodies(scenario);

				this.scene = Object.create(Scene);
				this.calculateDimensions();
				this.scene.createStage(scenario);
				this.initBodies(scenario);
				
				this.scene.setCentralBody(this.centralBody);
				
				GravityTicker.setSecondsPerTick(scenario.secondsPerTick);
				GravityTicker.setCalculationsPerTick(scenario.calculationsPerTick || ns.defaultCalculationsPerTick);
				
				this.showDate();

			},

			killScenario : function(){
				if(!this.scene) return;
				this.scene.kill();
				this.centralBody = null;
				this.scene = null;
				this.bodies = {};
			},

			createBodies : function(scenario) {
				var bodies = [];
				this.bodies = {};
				
				$.each(scenario.bodies, function(name, config){
					var current = Object.create(CelestialBody);
					$.extend(current, config);
					current.name = name;
					this.centralBody = this.centralBody && this.centralBody.mass > current.mass ? this.centralBody : current;
					this.bodies[current.name] = current;
					bodies.push(current);
				}.bind(this));

				this.centralBody.isCentral = true;

			},

			initBodies : function(scenario){

				$.each(this.bodies, function(name, current){
					if((typeof scenario.calculateAll === 'undefined' || !scenario.calculateAll) && !current.isCentral){
						current.mass = 1;
					}
					current.init();
					current.calculateTraceParams(this.size);
					
				}.bind(this));

				//after all is inialized
				$.each(this.bodies, function(name, current){
					this.scene.addBody(current);
					current.afterInitialized();
					//console.log(current.name, current.isCentral);
				}.bind(this));
				
				GravityTicker.setBodies(this.bodies);
			},

			getBody : function(name) {
				if(name === 'central' || typeof name === 'undefined') {
					return this.centralBody;
				}
				return this.bodies[name];
			},

			calculateDimensions : function(){
				var centralBodyName = this.getBody().name;
				//find the largest radius in km among all bodies
				var largestRadius = _.reduce(this.bodies, function(memo, body){
					return memo < body.radius ? body.radius : memo;
				}, 0);
				//find the largest semi major axis in km among all bodies
				var largestSMA = _.reduce(this.bodies, function(memo, body){ 
					return (!body.isCentral && body.orbit && body.orbit.base.a > memo) ? body.orbit.base.a : memo;
				}, 0);
				var smallestSMA = _.reduce(this.bodies, function(memo, body){ 
					return (!body.isCentral && body.orbit && (!body.relativeTo || body.relativeTo == centralBodyName) && (!memo || body.orbit.base.a < memo)) ? body.orbit.base.a : memo;
				}, 0);
				smallestSMA *= ns.KM;
				largestSMA *= ns.KM;
				largestRadius *= ns.KM;

				ns.SCALE_3D = 10000 / largestSMA;
				//console.log('universe size', largestSMA, ' m');
				
				this.size = largestSMA;
				this.scene.setDimension(largestSMA, smallestSMA, largestRadius);

			},

			showDate : function(){
				this.date.setTime(ns.J2000.getTime() + (this.currentTime * 1000));
				this.dateDisplay.text(this.date.toISOString());
			},

			tick : function() {
				if(this.playing) {
					var deltaT = GravityTicker.tick();
					this.epochTime += deltaT;
					this.currentTime = ns.startEpochTime + this.epochTime;
					this.scene.updateCamera(true);
					this.scene.draw();
					this.showDate();

				} else {
					this.scene.updateCamera(false);
				}
				
				requestAnimFrame(this.tick.bind(this));
			},

			isPlaying : function() {
				return this.playing;
			}
		};
		
		return Universe;
		
	}
);


/**
 * Provides requestAnimationFrame in a cross browser way.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
 
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();