/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/CelestialBody',
		'orbit/algorithm/Verlet',
		'orbit/algorithm/GravityAlgorithm',
		//'orbit/scenario/Mercury6',
		'orbit/scenario/SolarSystem',
		//'orbit/scenario/EarthMoon',
		'_'
	], 
	function(ns, $, CelestialBody, Verlet, GravityAlgorithm, Scenario) {

		var debugEach;
		var Universe = {
			init : function(){

				ns.U = this;

				this.playing = false;

				this.calculateDimensions(Scenario.bodies);

				this.createStage();
				debugEach = Scenario.secondsPerTick * 5;
				GravityAlgorithm.setSecondsPerTick(Scenario.secondsPerTick);
				GravityAlgorithm.setCalculationsPerTick(Scenario.calculationsPerTick);

				this.bodies = this.createBodies(Scenario);

				this.curTime = 0;
				this.draw();


			},

			createBodies : function(Scenario) {
				var bodies = [];

				//find the largest radius in km among all bodies
				var largestRadius = _.reduce(Scenario.bodies, function(memo, body){ return memo < body.radius ? body.radius : memo; }, 0);
				
				var largestPxRadius = largestRadius / this.nkmPerPix;
				if(largestPxRadius < Scenario.largestRadius) {
					largestPxRadius = Scenario.largestRadius;
				}

				var radiusKmPerPix = largestRadius / largestPxRadius;
				
				$.each(Scenario.bodies, function(name, config){
					var current = Object.create(CelestialBody);
					$.extend(current, config);
					current.name = name;
					
					current.nmPerPix = this.nmPerPix;
					current.init();
					var pxRadius = current.radius / radiusKmPerPix;
					pxRadius = pxRadius < 1.5 ? 1.5 : pxRadius;
					current.pxRadius = pxRadius;
					$.extend(current, Verlet);

					this.root.addChild(current.getDisplayObject());

					bodies.push(current);
				}.bind(this));

				GravityAlgorithm.setBodies(bodies);
				return bodies;
				console.dir(bodies)
			},

			calculateDimensions : function(bodies){

				this.width = $(window).width();
				this.height = $(window).height();

				var maxDist = 0;
				var largestMass = 0;
				$.each(bodies, function(i, body){
					if(body.dist > maxDist) maxDist = body.dist;
					if(body.mass > largestMass) largestMass = body.mass;
				});

				this.nPixPerAU = ((this.height / 2) - 20) / (maxDist / ns.AU);
				this.nkmPerPix = ns.AU / this.nPixPerAU;
				this.nmPerPix = this.nkmPerPix * 1000;
			},

			createStage : function() {
				var canvas = $('<canvas id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.stage = new createjs.Stage("universe");

				this.root = new createjs.Container();
				this.stage.addChild(this.root);
				this.root.x = this.width / 2;
				this.root.y = this.height / 2;

				canvas.on('click', function(){
					this.playing = !this.playing;
					this.draw();
				}.bind(this))
			},

			draw : function(){
				
				if(this.playing) {
					var deltaT = GravityAlgorithm.tick();
					this.curTime += deltaT;
				} 

				if(this.curTime % debugEach === 0) {
					$.each(this.bodies, function(i, b){

						b.getDebug(this.root, this.curTime);
					}.bind(this))
				}
				this.stage.update();
				if(this.playing) setTimeout(this.draw.bind(this), 30);

			},



		};
		
		return Universe;
		
	}
);