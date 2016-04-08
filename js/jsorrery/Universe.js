/** 


*/

define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/CelestialBody',
		'jsorrery/algorithm/Ticker',
		'jsorrery/graphics3d/Scene',
		'jsorrery/gui/Gui',
		'jsorrery/graphics2d/Labels',
		'jsorrery/graphics3d/loaders/ResourceLoader',
		'_'
	], 
	function(ns, $, CelestialBody, Ticker, Scene, Gui, Labels, ResourceLoader) {
		'use strict';
		var Universe = {
			init : function(scenario, qstrSettings){
				ResourceLoader.reset();
				this.name = scenario.name;
				this.scenario = scenario;
				var initialSettings = _.extend({}, scenario.defaultGuiSettings, qstrSettings, scenario.forcedGuiSettings);
				//console.log(initialSettings);
				Gui.setDefaults(initialSettings);
				//Universe is, well, global
				ns.U = this;
				
				this.usePhysics = scenario.usePhysics || ns.USE_PHYSICS_BY_DEFAULT;
				
				Labels.init(); 

				//start/stop
				Gui.addBtn('play', Gui.START_ID, function(){
					this.playing = !this.playing;
				}.bind(this));

				this.dateDisplay = Gui.addDate(function(){
					this.playing = false;
					this.epochTime = 0;
					this.currentTime = this.startEpochTime = this.getEpochTime(Gui.getDate());
					this.repositionBodies();
					this.scene.onDateReset();
				}.bind(this));

				this.ticker = this.tick.bind(this);
				
				this.playing = false;
				this.epochTime = 0;

				this.date = Gui.getDate() || new Date();
				this.currentTime = this.startEpochTime = this.getEpochTime(this.date);
				
				this.createBodies(scenario);

				this.scene = Object.create(Scene);
				this.calculateDimensions();
				this.scene.createStage(scenario);

				this.initBodies(scenario);
				Ticker.setSecondsPerTick(scenario.secondsPerTick.initial);
				Ticker.setCalculationsPerTick(scenario.calculationsPerTick || ns.defaultCalculationsPerTick);
				var onSceneReady = ResourceLoader.getOnReady();

				onSceneReady.done(function(){
					this.showDate();
					Gui.putDefaults();
					this.scene.setCameraDefaults(initialSettings.cameraSettings);

					this.scene.draw();
					this.tick();
				}.bind(this));

				//delta T slider
				Gui.addSlider(Gui.DELTA_T_ID, scenario.secondsPerTick, function(val){
					Ticker.setSecondsPerTick(val);
				}.bind(this));

				return onSceneReady.promise();

			},

			kill : function(){
				//kills the animation callback
				this.killed = true;
				this.dateDisplay.off('.jsorrery');
				Gui.setDate(null);
				if(!this.scene) return;
				this.scene.kill();
				this.centralBody = null;
				this.scene = null;
				this.bodies = [];
				this.bodiesByName = {};

				Labels.kill();
			},

			createBodies : function(scenario) {
				
				var bodiesNames = Object.keys(scenario.bodies);
				this.bodies = bodiesNames.map(function(name){
					var config = scenario.bodies[name];
					var body = Object.create(CelestialBody);
					$.extend(body, config);
					body.name = name;
					return body;
				});

				this.centralBody = this.bodies.reduce(function(current, candidate) {
					return current && current.mass > candidate.mass ? current : candidate;
				}, null);

				this.bodiesByName = this.bodies.reduce(function(byName, body) {
					byName[body.name] = body;
					return byName;
				}, {});

				this.bodies.sort(function(a, b){
					return ((a.relativeTo || 0) && 1) - ((b.relativeTo || 0) && 1)
				});

				this.centralBody.isCentral = true;
				// console.log(this.bodies);
			},

			initBodies : function(scenario){
				this.bodies.forEach(function(body){
					if((typeof scenario.calculateAll === 'undefined' || !scenario.calculateAll) && !body.isCentral){
						body.mass = 1;
					}
					body.init();
					body.setPositionFromDate(this.currentTime, true);
				}.bind(this));

				this.setBarycenter();

				//after all is inialized
				this.bodies.forEach(function(body){
					// console.log(body.name, body.isCentral);

					this.scene.addBody(body);
					body.afterInitialized(true);
				}.bind(this));
				
				this.scene.setCentralBody(this.centralBody);

				Ticker.setBodies(this.bodies);
			},
			/* balance the system by calculating hte masses of the non-central bodies and placing the central body to balance it.*/
			setBarycenter : function(){
				var central = this.centralBody;
				if(!this.usePhysics || central.isStill || this.scenario.useBarycenter === false) return;
				var massRatio;
				var massCenter = {
					mass : 0,
					pos : new THREE.Vector3(),
					momentum : new THREE.Vector3()
				};

				this.bodies.forEach(function(b){
					if(b === central) return;
					massCenter.mass += b.mass;
					massRatio = b.mass / massCenter.mass;
					massCenter.pos = massCenter.pos.add(b.getPosition().multiplyScalar(massRatio));
					massCenter.momentum = massCenter.momentum.add(b.getVelocity().multiplyScalar(b.mass));
				});

				massCenter.momentum.multiplyScalar(1 / massCenter.mass);
				massRatio = massCenter.mass / central.mass;
				central.velocity = massCenter.momentum.multiplyScalar(massRatio * -1);
				central.position = massCenter.pos.clone().multiplyScalar(massRatio * -1);
				this.bodies.forEach(function(b){
					if(b === central || (b.relativeTo && b.relativeTo != central.name)) return;
					b.velocity.add(central.velocity);
					//if central body's mass is way bigger than the object, we assume that the central body is the center of rotation. Otherwise, it's the barycenter
					if(central.mass / b.mass > 10e10) {
						b.position.add(central.position);
					} else if(b.relativeTo === central.name) {
						b.relativeTo = false;
					}
				});
			},

			repositionBodies : function(){
				// console.log(this.bodies);

				this.bodies.forEach(function(body){
					body.reset();
					body.setPositionFromDate(this.currentTime, true);
					// console.log(body.name);
				}.bind(this));

				Ticker.tick(false, this.currentTime);

				this.setBarycenter();

				//adjust position depending on other bodies' position (for example a satellite is relative to its main body)
				this.bodies.forEach(function(body){
					body.afterInitialized(false);
				});
			},

			getBody : function(name) {
				if(name === 'central' || !name) {
					return this.centralBody;
				}
				return this.bodiesByName[name];
			},

			calculateDimensions : function(){
				var centralBodyName = this.getBody().name;
				//find the largest radius in km among all bodies
				var largestRadius = this.bodies.reduce(function(memo, body){
					return memo < body.radius ? body.radius : memo;
				}, 0);
				//find the largest semi major axis in km among all bodies
				var largestSMA = this.bodies.reduce(function(memo, body){ 
					return (!body.isCentral && body.orbit && body.orbit.base.a > memo) ? body.orbit.base.a : memo;
				}, 0);
				var smallestSMA = this.bodies.reduce(function(memo, body){ 
					return (!body.isCentral && body.orbit && (!body.relativeTo || body.relativeTo == centralBodyName) && (!memo || body.orbit.base.a < memo)) ? body.orbit.base.a : memo;
				}, 0);
				smallestSMA *= ns.KM;
				largestSMA *= ns.KM;
				largestRadius *= ns.KM;

				//console.log('universe size', largestSMA, ' m');
				
				this.size = largestSMA;
				this.scene.setDimension(largestSMA, smallestSMA, largestRadius);

			},

			showDate : function(){
				this.date.setTime(ns.J2000.getTime() + (this.currentTime * 1000));
				Gui.setDate(this.date);
			},

			tick : function() {
				if(this.killed) return;
				if(this.playing) {
					
					this.epochTime += Ticker.getDeltaT();
					this.currentTime = this.startEpochTime + this.epochTime;
					Ticker.tick(this.usePhysics, this.currentTime);
					
					this.scene.updateCamera();
					this.scene.draw();
					this.showDate();
				} else {
					this.scene.updateCamera();
				}
				
				requestAnimFrame(this.ticker);
			},

			getScene : function(){
				return this.scene;
			},

			getEpochTime : function(userDate) {
				userDate = userDate || new Date();
				return ((userDate - ns.J2000) / 1000) ;
			},

			isPlaying : function() {
				return this.playing;
			},

			stop : function(){
				this.playing = false;
				this.scene.updateCamera();
				this.scene.draw();
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