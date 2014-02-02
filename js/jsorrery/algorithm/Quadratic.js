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
		var printed = false;
		var bodies;
		var n;

		var calculateForces = function(n, idx){
			var workVect=new THREE.Vector3(), i, j;
			for(i=0; i<bodies.length; i++){
				n[i].force[idx] = n[i].force[idx] || new THREE.Vector3();
				n[i].pos[idx] = n[i].pos[idx] || bodies[i].getPosition();
				n[i].vel[idx] = n[i].vel[idx] || bodies[i].velocity.clone();
				//loop in following bodies and calculate forces between them and this one at t0
				for(j=i+1; j<bodies.length; j++){
					n[j].force[idx] = n[j].force[idx] || new THREE.Vector3();
					n[j].pos[idx] = n[j].pos[idx] || bodies[j].getPosition();
					n[j].vel[idx] = n[j].vel[idx] || bodies[j].velocity.clone();
					if(bodies[i].mass === 1 && bodies[j].mass === 1) {
						continue;
					};
					workVect = Gravity.getGForceBetween(bodies[i].mass, bodies[j].mass, n[i].pos[idx], n[j].pos[idx]);
					//add forces (for the first body, it is the reciprocal of the calculated force)
					n[i].force[idx].sub(workVect);
					n[j].force[idx].add(workVect);
				}
			}
		};

		var Quadratic = {
			name : 'Quadratic',
			
			setBodies : function(bodiesP) {
				bodies = bodiesP;
				bodies.sort(function(a, b){
					return a.mass > b.mass ? -1 : 1;
				});

				n = [];
				for(var i=0; i<bodies.length; i++){
					n[i] = {};
					n[i].force = [];
					n[i].pos = [];
					n[i].vel = [];
					n[i].accel = [];
				}

			},

			moveBodies : function(deltaT){
				if(!printed) {
					console.log('Quadratic');
					printed = true;
				}
				var halfDeltaT = deltaT / 2;
				var deltaTSq = Math.pow(deltaT, 2);
				var deltaT3rd = Math.pow(deltaT, 3);
				var deltaT4th = Math.pow(deltaT, 4);

				var i;

				//forces at t0;
				calculateForces(n, 0);

				//find accel at t0 and pos at t0.5
				for(i=0; i<bodies.length; i++){
					//pos05 = pos0 + ((deltat/2) * vel0) + (0.5 * Math.pow((deltat / 2), 2)) * accel);
					n[i].accel[0] = n[i].force[0].clone().multiplyScalar(bodies[i].invMass); 

					n[i].pos[1] = n[i].pos[0].clone()
						.add(n[i].vel[0].clone().multiplyScalar(halfDeltaT))
						.add(n[i].accel[0].clone().multiplyScalar(0.5 * Math.pow(halfDeltaT, 2)));
				}


				//find forces at t0.5
				calculateForces(n, 1);

				for(i=0; i<bodies.length; i++){

					//find accel at t0.5 and positions at t1
					n[i].accel[1] = n[i].force[1].clone().multiplyScalar(bodies[i].invMass);
					//pos1 = pos0 + (vel0 * deltat) + (accel05 * 0.5 * Math.pow(deltaT, 2))
					n[i].pos[2] = n[i].pos[0].clone()
						.add(n[i].vel[0].clone().multiplyScalar(deltaT))
						.add(n[i].accel[1].clone().multiplyScalar(0.5 * deltaTSq));

				}

				//find forces at t1
				calculateForces(n, 2);

				for(i=0; i<bodies.length; i++){

					//find accel at t1
					n[i].accel[2] = n[i].force[2].clone().multiplyScalar(bodies[i].invMass);

				}

				var c1, c2, deltaV, deltaP;
				for(i=0; i<bodies.length; i++){		

					//c1 = ((-3 * accel0) - accel1 + (4 * accel05) ) / deltaT
					c1 = n[i].accel[0].clone().multiplyScalar(-3)
						.sub(n[i].accel[2])
						.add(n[i].accel[1].clone().multiplyScalar(4))
						.multiplyScalar(1/deltaT);
					//c2 = ( 2 * (accel0 + accel1 - (2 * accel05)) ) / deltaTSq
					c2 = n[i].accel[0].clone()
						.add(n[i].accel[2])
						.sub(n[i].accel[1].clone().multiplyScalar(2))
						.multiplyScalar(2)
						.multiplyScalar(1/deltaTSq);


					//deltav = (accel0 * deltaT) + ((deltaTSq/2) * c1) + ((deltaT3rd/3) * c2)
					deltaV = n[i].accel[0].clone()
						.multiplyScalar(deltaT)
						.add(c1.clone().multiplyScalar((deltaTSq/2)))
						.add(c2.clone().multiplyScalar((deltaT3rd/3)));

					//deltap = (vel0 * deltaT) + ((deltaTSq/2) * accel0) + ((deltaT3rd/6) * c1) + ((deltaT4th/12) * c2)
					deltaP = n[i].vel[0].clone()
						.multiplyScalar(deltaT)
						.add(n[i].accel[0].clone().multiplyScalar(deltaTSq/2))
						.add(c1.clone().multiplyScalar((deltaT3rd/6)))
						.add(c2.clone().multiplyScalar((deltaT4th/12)));

					bodies[i].position.add(deltaP);	
					bodies[i].velocity.add(deltaV);




					if(false && bodies[i].name === 'apolloTLI'){

						//console.log(bodies[i].name);
						var pos0 = DbgPoint.getNew(n[i].pos[0]);
						var pos1 = DbgPoint.getNew(n[i].pos[1]);
						var pos2 = DbgPoint.getNew(n[i].pos[2]);
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

						pos0.addVector(n[i].accel[0]);
						pos0.addVector(n[i].vel[0].clone().multiplyScalar(1/100), 0xaaff00);
						pos1.addVector(n[i].accel[1]);
						pos2.addVector(n[i].accel[2]);


						pos0.addVector(deltaP, 0x0000ff);
						pos0.addVector(deltaV, 0x00ffff);

						//console.log('pos',bodies[i].position);
						//console.log('deltap',deltaP.length());
						//console.log('vel',bodies[i].velocity);
						//console.log('deltav',deltaV.length());/**/

					}

					n[i].force = [];
					n[i].pos = [];
					n[i].vel = [];
					n[i].accel = [];/**/


					/*console.log(bodies[i].name);
					console.log(bodies[i].position.length());
					console.log(bodies[i].velocity.length());/**/

				}

				//if(++i==100)ns.U.stop();

			}
		};
		return Quadratic;

	}
);
