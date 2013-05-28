/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/CelestialBody',
		'orbit/algorithm/GravityTicker',
		'orbit/scenario/Mercury6',
		//'orbit/scenario/SolarSystem',
		//'orbit/scenario/EarthMoon',
		'_'
	], 
	function(ns, $, CelestialBody, GravityTicker, Scenario) {

		var Universe = {
			init : function(){

				ns.U = this;

				this.playing = false;

				this.calculateDimensions(Scenario.bodies);

				this.createStage();
				
				GravityTicker.setSecondsPerTick(Scenario.secondsPerTick);
				GravityTicker.setCalculationsPerTick(Scenario.calculationsPerTick);

				this.bodies = this.createBodies(Scenario);

				this.curTime = 0;
				this.draw();


			},

			createBodies : function(Scenario) {
				var bodies = [];
				this.bodies = {};

				//find the largest radius in km among all bodies
				var largestRadius = _.reduce(Scenario.bodies, function(memo, body){ return memo < body.radius ? body.radius : memo; }, 0);
				
				var largestPxRadius = largestRadius / ns.nkmPerPix;
				if(largestPxRadius < Scenario.largestRadius) {
					largestPxRadius = Scenario.largestRadius;
				}
				var radiusKmPerPix = largestRadius / largestPxRadius;
				
				$.each(Scenario.bodies, function(name, config){
					var current = Object.create(CelestialBody);
					$.extend(current, config);
					current.name = name;
					var pxRadius = current.radius / radiusKmPerPix;
					pxRadius = pxRadius < 1.5 ? 1.5 : pxRadius;
					current.pxRadius = pxRadius;
					console.dir(current);
					if(current.dist == 0 && current.speed == 0 && !current.orbit) {
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
					this.root.addChild(current.getDisplayObject());
				}.bind(this));

				//this.bodies.jupiter.setTraceFrom(this.bodies.earth);
				
				GravityTicker.setBodies(bodies);
				return bodies;
			},

			calculateDimensions : function(bodies){

				this.width = $(window).width();
				this.height = $(window).height();

				this.center = {
					x : this.width / 2,
					y : this.height / 2
				};
				var maxDist = 0;
				var largestMass = 0;
				$.each(bodies, function(i, body){
					if(body.dist > maxDist) maxDist = body.dist;
					if(body.mass > largestMass) largestMass = body.mass;
				});

				ns.nPixPerAU = ((this.height / 2) - 20) / (maxDist / ns.AU);
				ns.nkmPerPix = ns.AU / ns.nPixPerAU;
				ns.nmPerPix = ns.nkmPerPix * 1000;
			},

			createStage : function() {
				var canvas = $('<canvas id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.stage = new createjs.Stage("universe");

				this.root = new createjs.Container();
				this.stage.addChild(this.root);

				canvas.on('click', function(){
					this.playing = !this.playing;
					this.draw();
				}.bind(this))
			},

			draw : function(){
				
				if(this.playing) {
					var deltaT = GravityTicker.tick();
					this.curTime += deltaT;
					ns.curTime = this.curTime;
				}
				//console.log(deltaT);
				$.each(this.bodies, function(n, b){
					b.drawMove();
				});

				//center to central body
				this.root.x = -this.centralBody.pixelPosition.x + this.center.x;
				this.root.y = -this.centralBody.pixelPosition.y + this.center.y;

				this.stage.update();
				if(this.playing) setTimeout(this.draw.bind(this), 30);

			}
		};
		
		return Universe;
		
	}
);