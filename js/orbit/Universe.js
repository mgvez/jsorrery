/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/CelestialBody',
		'orbit/algorithm/GravityTicker',
		'orbit/graphics2d/Scene',
		'orbit/gui/Gui',
		//'orbit/scenario/Mercury6',
		'orbit/scenario/SolarSystem',
		//'orbit/scenario/EarthMoon',
		'_'
	], 
	function(ns, $, CelestialBody, GravityTicker, Scene, Gui, Scenario) {

		var Universe = {
			init : function(){

				ns.U = this;

				this.playing = false;

				this.scene = Object.create(Scene);
				this.scene.createStage();
				this.calculateDimensions(Scenario);
				
				GravityTicker.setSecondsPerTick(Scenario.secondsPerTick);
				GravityTicker.setCalculationsPerTick(Scenario.calculationsPerTick);

				this.bodies = this.createBodies(Scenario.bodies);

				this.curTime = 0;

				Gui.init(this);

				this.tick();

			},

			createBodies : function(scenario) {
				var bodies = [];
				this.bodies = {};
				
				$.each(scenario, function(name, config){
					var current = Object.create(CelestialBody);
					$.extend(current, config);
					current.name = name;
					if(!current.orbit) {
						this.centralBody = current;
						current.isCentral = true;
					} else if(!ns.calculatePerturbations){
						current.mass = 1;
					}
					this.bodies[current.name] = current;
					bodies.push(current);
				}.bind(this));

				$.each(this.bodies, function(name, current){
					current.init();
					this.scene.addBody(current);
				}.bind(this));
				
				GravityTicker.setBodies(bodies);
				return bodies;
			},

			calculateDimensions : function(scenario){

				//find the largest radius in km among all bodies
				var largestRadius = _.reduce(scenario.bodies, function(memo, body){
					return memo < body.radius ? body.radius : memo;
				}, 0);
				//find the largest semi major axis in km among all bodies
				var largestSMA = _.reduce(scenario.bodies, function(memo, body){ 
					return (body.orbit && body.orbit.base.a > memo) ? body.orbit.base.a : memo;
				}, 0);
				this.scene.setDimension(largestSMA, largestRadius);

			},

			tick : function() {
				if(this.playing) {
					var deltaT = GravityTicker.tick();
					this.curTime += deltaT;
					ns.curTime = this.curTime;
				}
				//console.log(deltaT);
				
				this.scene.draw();
				if(this.playing) setTimeout(this.tick.bind(this), 30);
			}
		};
		
		return Universe;
		
	}
);