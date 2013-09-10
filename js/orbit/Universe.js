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
		'_'
	], 
	function(ns, $, CelestialBody, GravityTicker, Scene, Gui) {
		'use strict';
		var Universe = {
			init : function(scenario){
				//Universe is, well, global
				ns.U = this;
				
				Gui.addBtn('start/stop', 'start', function(){
					this.playing = !this.playing;
				}.bind(this));

				this.dateDisplay = Gui.addDate();
				this.dateDisplay.on('change.orbit', function(){

					this.playing = false;
					this.epochTime = 0;
					this.currentTime = this.startEpochTime = this.getEpochTime(Gui.getDate());
					this.positionBodies();
					this.scene.onDateReset();

				}.bind(this));

				this.ticker = this.tick.bind(this);
				
				this.playing = false;
				this.epochTime = 0;
				this.currentTime = this.startEpochTime = this.getEpochTime();
				this.date = new Date();
				this.createBodies(scenario);

				this.scene = Object.create(Scene);
				this.calculateDimensions();
				var onSceneReady = this.scene.createStage(scenario);

				onSceneReady.then(function(){
					this.initBodies(scenario);
					this.scene.setCentralBody(this.centralBody);
					GravityTicker.setSecondsPerTick(scenario.secondsPerTick);
					GravityTicker.setCalculationsPerTick(scenario.calculationsPerTick || ns.defaultCalculationsPerTick);
					this.showDate();
					this.tick();
				}.bind(this));

			},

			kill : function(){
				//kills the animation callback
				this.killed = true;
				this.dateDisplay.off('.orbit');

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
					var body = Object.create(CelestialBody);
					$.extend(body, config);
					body.name = name;
					this.centralBody = this.centralBody && this.centralBody.mass > body.mass ? this.centralBody : body;
					this.bodies[body.name] = body;
					bodies.push(body);
				}.bind(this));

				this.centralBody.isCentral = true;

			},

			initBodies : function(scenario){

				$.each(this.bodies, function(name, body){
					if((typeof scenario.calculateAll === 'undefined' || !scenario.calculateAll) && !body.isCentral){
						body.mass = 1;
					}
					body.init();
					body.calculateTraceParams(this.size);
					body.setPositionFromDate(this.currentTime);
					
				}.bind(this));

				//after all is inialized
				$.each(this.bodies, function(name, body){
					this.scene.addBody(body);
					body.afterInitialized();
					//console.log(body.name, body.isCentral);
				}.bind(this));
				
				GravityTicker.setBodies(this.bodies);
			},

			positionBodies : function(){
				$.each(this.bodies, function(name, body){
					body.setPositionFromDate(this.currentTime);
				}.bind(this));
				//adjust position depending on other bodies' position (for example a satellite is relative to its main body)
				$.each(this.bodies, function(name, body){
					body.afterInitialized();
				}.bind(this));
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
					var deltaT = GravityTicker.tick();
					this.epochTime += deltaT;
					this.currentTime = this.startEpochTime + this.epochTime;
					this.scene.updateCamera();
					this.scene.draw();
					this.showDate();

				} else {
					this.scene.updateCamera();
				}
				
				requestAnimFrame(this.ticker);
			},

			getEpochTime : function(userDate) {
				//userDate = userDate || new Date(2013, 2, 20, 11, 2);//new Date();
				//userDate = userDate || new Date(2008, 6, 1, 0, 0);//new Date();
				userDate = userDate || new Date();
				return ((userDate - ns.J2000) / 1000) ;
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