

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {
		//launch : 1968-12-21T12:51:00.000Z
		//EOI = launch + 695 secs = 1968-12-21T13:02:35.000Z 
		//TLI : 1968-12-21T15:47:05.000Z
		//http://projets.git/lab/jsorrery/index.htm?date=1968-12-21T15:47:05.000Z&scenario=EarthMoon&lookAt=0&planetScale=1
		//http://projets.git/lab/jsorrery/index.htm?scenario=Apollo8&lookAt=2&planetScale=1
		var NM_TO_KM = 1.852;
		var LB_TO_KG = 0.453592;
		var LBF_TO_NEWTON = 4.44822162;
		var FT_TO_M = 0.3048;
		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var epoch = new Date('1968-12-21T13:02:35.000Z');
		
		var system =  {
			name : 'Apollo8',
			title : 'Apollo 8 free return',
			commonBodies : ['earth', 'moon', 'sun', 'mercury', 'venus', 'mars'/**/],
			secondsPerTick : 50,
			calculationsPerTick : 10,
			calculateAll : true,
			defaultsGuiSettings : {
				date: new Date('1968-12-21T15:46:05.000Z')//epoch
			},
			bodies : {
				earth: {
					map : 'img/earthmap1k.jpg'
				},
				moon : {
					isPerturbedOrbit : true
				},
				apollo8 : {
					title : 'Apollo 8',
					relativeTo : 'earth',
					epoch : epoch,
					mass : 
					//CSM
					((62845 + 19900 + 3951) * LB_TO_KG) + 
					//S-IVB
					//dry                       propellant at start of 2nd burn
					((25926+1626) * LB_TO_KG) + (160333 * LB_TO_KG),
					radius : 2,
					color : "#ffffff",
					nVertices : 2000,
					vertexDist : 100000,
					forceTrace : true,
					orbit : {
						relativeTo : 'earth',
						base : {
							a : (earthRadius + (99.99 * NM_TO_KM)) ,
							e : 0.00006,
							w : 125,
							M : 0,
							i : 32.509,
							o : 180 - 42.415
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : (360 / (88.19 * 60)) * ns.DAY,
							w : 0,
							o : 0
						}	
					},
					events : {
						TLI : {
							when : new Date('1968-12-21T15:47:05.000Z').getTime(),
							burnTime : 317.72 * 1000,
							thrust : 201777 * LBF_TO_NEWTON,
							burnMassDelta : 149510 * LB_TO_KG
						}
					},

					/*					
					onOrbitCompleted : function() {
						console.log(ns.U.epochTime / 60);
					},
					/**/
					afterCompleteMove : function(elapsedTime, absoluteDate){
						this.dbg = this.dbg || $('<div style="position:absolute;bottom:0;right:0;color:#fff">').appendTo('body');
						if(!absoluteDate) return;
						if(typeof this.TliStatus == 'undefined' && absoluteDate.getTime() >= this.events.TLI.when) {
							this.TliStatus = 1;
							this.events.TLI.endTime = this.events.TLI.when + this.events.TLI.burnTime;
							/*console.log(absoluteDate);
							console.log(this.events.TLI.when);/**/

							var moon = ns.U.getBody('moon');
							var a = moon.getAngleTo('earth');
							console.log('angle to moon', a * ns.RAD_TO_DEG);


							var dataSpeed = 25567 * FT_TO_M;

							console.log('velocity', this.events.TLI.speed);
							console.log('max velocity', this.events.TLI.maxSpeed);
							console.log('min velocity', this.events.TLI.minSpeed);
							console.log('velocity (data)',dataSpeed);
							console.log('mass',this.mass);

						} else if(this.TliStatus === 1 && absoluteDate.getTime() >= this.events.TLI.endTime) {
							console.log('****************');
							console.log(elapsedTime, this.events.TLI.endTime);
							console.log('velocity',this.events.TLI.speed);
							var dataSpeed = 35505.41 * FT_TO_M;
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
					}
				}
			}
		};


		return system;
		
	}
);