define(
	[
		'jsorrery/NameSpace',
		'jsorrery/algorithm/Gravity',
		'jsorrery/graphics3d/DebugPoint',
		'three',
		'_'
	],
	function(ns, Gravity, DbgPoint) {
		'use strict';
		var bodies;

		var Quadratic = {
			name : 'Quadratic',
			
			setBodies : function(bodiesP) {
				bodies = bodiesP;
			},

			moveBodies : function(epochTime, deltaT){
				
				var halfDeltaT = deltaT / 2;
				var deltaTSq = Math.pow(deltaT, 2);
				var deltaT3rd = Math.pow(deltaT, 3);
				var deltaT4th = Math.pow(deltaT, 4);

				var i, b, n = {};

				//forces at t0;
				Gravity.calculateGForces(bodies);

				//find accel at t0 and pos at t0.5
				for(i=0; i<bodies.length; i++){
					b = bodies[i];
					if(b.calculateFromElements) {
						b.setPositionFromDate(epochTime + (deltaT/2));
					} else {
						n[i] = {};
						n[i].accel = [
							b.force.clone().multiplyScalar(b.invMass)
						];
						n[i].pos = [
							b.position.clone(),
							//pos0.5 = pos0 + ((deltat/2) * vel0) + (0.5 * Math.pow((deltat / 2), 2)) * accel);
							b.position.clone()
								.add(b.velocity.clone().multiplyScalar(halfDeltaT))
								.add(n[i].accel[0].clone().multiplyScalar(0.5 * Math.pow(halfDeltaT, 2)))
						];
						b.position.copy(n[i].pos[1]);
					}
				}

				//forces at t0.5 (all bodies are positionned at t0.5)
				Gravity.calculateGForces(bodies);

				//find accel at t0.5 and positions at t1
				for(i=0; i<bodies.length; i++){
					b = bodies[i];
					if(b.calculateFromElements) {
						b.setPositionFromDate(epochTime + deltaT);
					} else {
						n[i].accel.push(b.force.clone().multiplyScalar(b.invMass));

						//pos1 = pos0 + (vel0 * deltat) + (accel05 * 0.5 * Math.pow(deltaT, 2))
						n[i].pos.push(
							n[i].pos[0].clone()
								.add(b.velocity.clone().multiplyScalar(deltaT))
								.add(n[i].accel[1].clone().multiplyScalar(0.5 * deltaTSq))
						);
						b.position.copy(n[i].pos[2]);
					}
				}

				//forces at t1
				Gravity.calculateGForces(bodies);

				//find accel at t1
				for(i=0; i<bodies.length; i++){
					b = bodies[i];
					if(!b.calculateFromElements) {
						n[i].accel.push(b.force.clone().multiplyScalar(b.invMass));
					}
				}

				//perform the actual integration
				var c1, c2, deltaV, deltaP;
				for(i=0; i<bodies.length; i++){		

					b = bodies[i];
					if(!b.calculateFromElements) {
						c1 = n[i].accel[0].clone().multiplyScalar(-3)
							.sub(n[i].accel[2])
							.add(n[i].accel[1].clone().multiplyScalar(4))
							.multiplyScalar(1/deltaT);

						c2 = n[i].accel[0].clone()
							.add(n[i].accel[2])
							.sub(n[i].accel[1].clone().multiplyScalar(2))
							.multiplyScalar(2)
							.multiplyScalar(1/deltaTSq);

						deltaV = n[i].accel[0].clone()
							.multiplyScalar(deltaT)
							.add(c1.clone().multiplyScalar((deltaTSq/2)))
							.add(c2.clone().multiplyScalar((deltaT3rd/3)));

						deltaP = b.velocity.clone()
							.multiplyScalar(deltaT)
							.add(n[i].accel[0].clone().multiplyScalar(deltaTSq/2))
							.add(c1.clone().multiplyScalar((deltaT3rd/6)))
							.add(c2.clone().multiplyScalar((deltaT4th/12)));

						bodies[i].position.copy(n[i].pos[0]).add(deltaP);	
						bodies[i].velocity.add(deltaV);
					}


					if(false && b.name === 'apolloTLI'){

						console.log(n);
						var pos0 = DbgPoint.getNew(n[i].pos[0], 0xff0000);
						var pos1 = DbgPoint.getNew(n[i].pos[1], 0x00ff00);
						var pos2 = DbgPoint.getNew(n[i].pos[2], 0x0000ff);
						//console.log('==pos==');
						//console.log(n[i].pos[0].length());
						//console.log(n[i].pos[1].length() - n[i].pos[0].length());
						//console.log(n[i].pos[2].length() - n[i].pos[0].length());
						

						//console.log('==vel==');
						//console.log(n[i].vel[0].length());
						//console.log('==force==');
						//console.log(n[i].force[0].length());
						//console.log(n[i].force[1].length());
						//console.log(n[i].force[2].length());
						//console.log('==accel==');
						//console.log(n[i].accel[0].length());
						//console.log(n[i].accel[1].length());
						//console.log(n[i].accel[2].length());

						pos0.addVector(n[i].accel[0], 0xff0000);
						pos0.addVector(b.velocity.clone().multiplyScalar(1/100), 0xaaff00);
						pos1.addVector(n[i].accel[1], 0x00ff00);
						pos2.addVector(n[i].accel[2], 0x0000ff);


						//pos0.addVector(deltaP, 0x0000ff);
						//pos0.addVector(deltaV, 0x00ffff);

						//console.log('pos',bodies[i].position);
						//console.log('deltap',deltaP.length());
						//console.log('vel',bodies[i].velocity);
						//console.log('deltav',deltaV.length());/**/

					}
					//ns.U.stop();
				}
			}
		};
		return Quadratic;

	}
);
