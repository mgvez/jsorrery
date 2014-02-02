

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies',
		'jsorrery/scenario/NasaNumbers',
		'jsorrery/graphics2d/Labels'
	], 
	function(ns, common, nasaNumbers, Labels) {
		//apollo 10, 11, 13 & 17 don't work. 13 and 17 in particular seem to have errors in the numbers, as the orbits are very far from the moon. 10 & 11 need a correction of about 1° to seem more accurate
		var g = window.location.search.match(/apollo=([0-9]+)/);
		var apolloNumber = (g && g[1]) || '8';
		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var apolloEarthOrbit = nasaNumbers.get('earth', 'Apollo'+apolloNumber);
		var apolloTLIOrbit = nasaNumbers.get('TLI', 'Apollo'+apolloNumber);
		var epoch = apolloTLIOrbit.epoch;

		var apolloBase = {
			title : 'Apollo '+apolloNumber,
			relativeTo : 'earth',
			mass : 1,
			radius : 2,
			color : "#00ffff",
			traceColor : '#ffffff',
			vertexDist : 100000,
			forceTrace : true,
			data : {
			},
			logForces : true
		};
		var dbg;
		var apolloTLI = _.extend(
			{},
			apolloBase,
			{
				customInitialize : function(){
					this.data = {};
				},
				afterCompleteMove : function(elapsedTime, absoluteDate, deltaT){
					var dist;

					
					
					if(!this.data.isOnReturnTrip) {
						if(!this.data.hasTLILabel && this.relativePosition.x != 0){
							Labels.addEventLabel('Trans Lunar Injection', this.relativePosition.clone(), ns.U.getBody(this.relativeTo));
							this.data.hasTLILabel = true;
						}


						dist = (Math.abs(this.position.clone().sub(ns.U.getBody('moon').position).length()) / 1000) - ns.U.getBody('moon').radius;
						var moonSpeed = 0;
						if(this.data.lastMoonDist){
							moonSpeed = ((this.data.lastMoonDist-dist) / deltaT) * 1000;
						}

						if(!this.data.minMoonDist || dist < this.data.minMoonDist){
							this.data.minMoonDist = dist;
						} else if(this.data.lastMoonDist == this.data.minMoonDist){
							Labels.addEventLabel('Closest distance to<br>the Moon: '+Math.round(this.data.minMoonDist)+' km', this.previousRelativePosition.clone(), ns.U.getBody(this.relativeTo));
							this.data.isOnReturnTrip = true;
							//ns.U.stop();
						}
						/*
						if(((dist)/1.60934)<= (32999)) {
							dbg.text(((dist/1.60934))+' miles from moon, '+(this.speed*3.28084)+' ft/s ('+(moonSpeed*3.28084)+' ft/s rel to moon)'); 
							ns.U.playing=false;
						}/**/

						this.data.lastMoonDist = dist;
						this.data.minMoonSpeed = !this.data.minMoonSpeed || (this.data.minMoonSpeed > moonSpeed) ? moonSpeed : this.data.minMoonSpeed;
						this.data.minSpeed = !this.data.minSpeed || (this.data.minSpeed > this.speed) ? this.speed : this.data.minSpeed;

						/*dbg = dbg || $('<div style="position:absolute;top:60px;left:20px">').appendTo('body');
						this.data.maxspeed = this.data.maxspeed || 0;
						if(this.data.maxspeed < this.speed) this.data.maxspeed = this.speed;  /**/
						//dbg.text((this.speed*3.28084)+' ft/s'); 
						//dbg.html((this.speed)+' m/s ( max '+this.data.maxspeed+' )<br>moon speed '+moonSpeed+ '( min '+this.data.minMoonSpeed+' )');


					} else {
						dist = (Math.abs(this.position.clone().sub(ns.U.getBody('earth').position).length()) / 1000 ) - ns.U.getBody('earth').radius;
						if(!this.data.minEarthDist || dist < this.data.minEarthDist){
							this.data.minEarthDist = dist;
						} else if(this.data.lastEarthDist == this.data.minEarthDist && dist < (Math.abs(this.position.clone().sub(ns.U.getBody('moon').position).length()) / 1000)){
							Labels.addEventLabel('Closest distance to<br>the Earth: '+Math.round(this.data.minEarthDist)+' km<br>Simulation stopped', this.previousRelativePosition.clone(), ns.U.getBody(this.relativeTo));
							
							ns.U.stop();
						}

						this.data.lastEarthDist = dist
						
					}
				}
			}
		);

		var system = {
			usePhysics : true,
			name : 'Apollo',
			title : 'Apollo '+apolloNumber+' free return trajectory',
			commonBodies : ['earth', 'moon'/*, 'sun', 'mercury', 'venus', 'mars'/**/],
			secondsPerTick : 100,
			calculationsPerTick : 50,
			calculateAll : true,
			forcedGuiSettings : {
				date: epoch//epoch
			},
			bodies : {
				earth:{
					isStill : true
				},/**/		
				apolloTLI : _.extend({},
					apolloTLI,
					apolloTLIOrbit,
					{
						title : 'Apollo '+apolloNumber,
					}
				)/*,
				apolloEO : _.extend({},
					apolloNumber === '8' ? apollo8 : apolloBase,
					apolloEarthOrbit,
					{
						title : 'Apollo '+apolloNumber+' EO',
					}
				)/**/
			},
			help : "Paths of Apollo <a href=\"http://en.wikipedia.org/wiki/Free_return_trajectory\" target=\"_blank\">free return trajectories</a> are calculated from data available on Nasa's website. Data for every Moon mission is available, but all don't work perfectly in the simulation. I chose to display Apollo 8, because it was the first mission to get to the moon. The return path doesn't get exactly to Earth's atmosphere, but keep in mind that the simulated trajectory that you see here does not depend solely on Apollo's numbers, but also on the Moon's and the Earth's calculated positions, velocities and masses. Furthermore, I can't pretend that the algorithm I programmed to calculate the forces resulting from gravity is on par with what Nasa scientists can do. Still, the simulation is precise enough to get a very good idea of the shape of the free return trajectory and the genius behind it."
		};


		return system;
		
	}
);