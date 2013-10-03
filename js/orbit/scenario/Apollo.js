

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies',
		'orbit/scenario/ApolloNumbers'
	], 
	function(ns, common, apolloNumbers) {
		//apollo 10, 11, 13 & 17 don't work. 13 and 17 in particular seem to have errors in the numbers, as the orbits are very far from the moon. 10 & 11 need a correction of about 1° to seem more accurate
		var apolloNumber = '17';
		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var apolloEarthOrbit = apolloNumbers.get('earth', 'Apollo'+apolloNumber);
		var apolloTLIOrbit = apolloNumbers.get('TLI', 'Apollo'+apolloNumber);
		var epoch = apolloEarthOrbit.epoch;

		var apolloBase = {
			title : 'Apollo '+apolloNumber,
			relativeTo : 'earth',
			mass : 
			//CSM
			((62845 + 19900 + 3951) * ns.LB_TO_KG) + 
			//S-IVB
			//dry                       propellant at start of 2nd burn
			((25926+1626) * ns.LB_TO_KG) + (160333 * ns.LB_TO_KG),
			radius : 2,
			color : "#00ffff",
			traceColor : '#ffffff',
			vertexDist : 100000,
			forceTrace : true,
			events : {
				TLI : {
					when : new Date('1968-12-21T15:47:05.000Z').getTime(),
					burnTime : 317.72 * 1000,
					thrust : 201777 * ns.LBF_TO_NEWTON,
					burnMassDelta : 149510 * ns.LB_TO_KG
				}
			},


			/*					
			onOrbitCompleted : function() {
				console.log(ns.U.epochTime / 60);
			},
			/**/
			/*
			afterCompleteMove : function(elapsedTime, absoluteDate){
				this.dbg = this.dbg || $('<div style="position:absolute;bottom:0;right:0;color:#fff">').appendTo('body');
				if(!absoluteDate) return;
				if(typeof this.TliStatus == 'undefined' && absoluteDate.getTime() >= this.events.TLI.when) {
					this.TliStatus = 1;
					this.events.TLI.endTime = this.events.TLI.when + this.events.TLI.burnTime;
					
					var moon = ns.U.getBody('moon');
					var a = moon.getAngleTo('earth');
					console.log('angle to moon', a * ns.RAD_TO_DEG);


					var dataSpeed = 25567 * ns.FT_TO_M;

					console.log('velocity', this.events.TLI.speed);
					console.log('max velocity', this.events.TLI.maxSpeed);
					console.log('min velocity', this.events.TLI.minSpeed);
					console.log('velocity (data)',dataSpeed);
					console.log('mass',this.mass);

				} else if(this.TliStatus === 1 && absoluteDate.getTime() >= this.events.TLI.endTime) {
					console.log('****************');
					console.log(elapsedTime, this.events.TLI.endTime);
					console.log('velocity',this.events.TLI.speed);
					var dataSpeed = 35505.41 * ns.FT_TO_M;
					console.log('velocity (data)',dataSpeed);
					console.log('mass',this.mass);
					this.TliStatus = 0; 
				}

			},
			beforeMove : function(deltaT) {
				this.events.TLI.pos = this.getPosToEarth();
				if(this.TliStatus === 1) {
					this.force = this.events.TLI.velocity.clone().normalize().multiplyScalar(this.events.TLI.thrust);
					//console.log(this.mass, deltaT);
					this.mass = this.mass - ((this.events.TLI.burnMassDelta / (this.events.TLI.burnTime/1000)) * (deltaT));
				}
			},
			getPosToEarth : function(){
				return this.position.clone().sub(ns.U.getBody('earth').position);
			},

			afterMove : function(deltaT) {
				
				if(this.events.TLI.pos) {
					this.events.TLI.velocity = this.getPosToEarth().sub(this.events.TLI.pos);
					this.events.TLI.speed = this.events.TLI.velocity.length() / deltaT;
					if(!this.events.TLI.maxSpeed || this.events.TLI.speed > this.events.TLI.maxSpeed){
						this.events.TLI.maxSpeed = this.events.TLI.speed;
					}
					if(!this.events.TLI.minSpeed || this.events.TLI.speed < this.events.TLI.minSpeed){
						this.events.TLI.minSpeed = this.events.TLI.speed;
					}
					//if(this.dbg) this.dbg.text(this.events.TLI.speed);
				}
			}/**/
		};

		var system = {
			name : 'Apollo',
			title : 'Apollo '+apolloNumber+' free return trajectory',
			commonBodies : ['earth', 'moon', 'sun', 'mercury', 'venus', 'mars'/**/],
			secondsPerTick : 50,
			calculationsPerTick : 50,
			calculateAll : true,
			defaultsGuiSettings : {
				date: epoch//epoch
			},
			bodies : {
				earth:{
					map:'img/earthmap1k_KSC.jpg'
				},
				moon : {
					isPerturbedOrbit : true
				},
				apollo8EO : _.extend({},
					apolloBase,
					apolloEarthOrbit,
					{
						title : 'Apollo '+apolloNumber+' EO',
					}
				),
				apollo8TLI : _.extend({},
					apolloBase,
					apolloTLIOrbit,
					{
						title : 'Apollo '+apolloNumber+' TLI',
					}
				)/**/
			}
		};


		return system;
		
	}
);