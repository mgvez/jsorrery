/** 


*/

define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/CelestialBody',
		'orbit/algorithm/Verlet',
		'orbit/algorithm/Algorithm',
		'orbit/scenario/Mercury6'
		//'orbit/scenario/SolarSystem'
	], 
	function(ns, $, CelestialBody, Verlet, Algorithm, Scenario) {

		
		var Universe = {
			init : function(){

				this.playing = true;
				this.width = $(window).width();
				this.height = $(window).height();

				var canvas = $('<canvas id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.stage = new createjs.Stage("universe");

				this.universe = new createjs.Container();
				this.stage.addChild(this.universe);
				this.universe.x = this.width / 2;
				this.universe.y = this.height / 2;

				var configs = Scenario.bodies;
				var bodies = [];

				var maxDist = 0;
				var largestMass = 0;
				var largestRad = Scenario.largestRadius;
				$.each(configs, function(i, config){
					if(config.dist > maxDist) maxDist = config.dist;
					if(config.mass > largestMass) largestMass = config.mass;
				});

				this.secondsPerTick = Scenario.secondsPerTick;
				
				Algorithm.setSecondsPerTick(this.secondsPerTick);
				Algorithm.setPrecision(50);

				//Combien de AU par pixel?
				this.nPixPerAU = ((this.height / 2) - 20) / (maxDist / ns.AU);
				
				this.nkmPerPix = ns.AU / this.nPixPerAU;
				this.nmPerPix = this.nkmPerPix * 1000;

				console.dir(this);

				$.each(configs, function(name, config){
					var current = Object.create(CelestialBody);
					$.extend(current, config);
					current.name = name;
					current.radius = (largestRad * current.mass) / largestMass;
					if(current.radius < 1) current.radius = Scenario.smallestRadius;

					current.nmPerPix = this.nmPerPix;
					$.extend(current, Verlet);

					bodies.push(current);
					current.init();
					this.universe.addChild(current.planet);
					this.universe.addChild(current.tracer);
				}.bind(this));


				Algorithm.setBodies(bodies);

				this.curTime = 0;
				this.bodies = bodies;
				this.draw();

				canvas.on('click', function(){
					this.playing = !this.playing;
					this.draw();
				}.bind(this))

			},

			draw : function(){
				
				var deltaT = Algorithm.tick();
				this.curTime += deltaT;

				this.stage.update();
				if(this.playing) setTimeout(this.draw.bind(this), 30);

			},



		};
		
		return Universe;
		
	}
);