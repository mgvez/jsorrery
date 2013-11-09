define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
		'use strict';
		var beginPos = new THREE.Vector3();
		var workVect = new THREE.Vector3();

		//xi+1 = xi + (xi - xi-1) + a * dt * dt

		var Verlet = {
			moveBody : function(body, deltaTIncrement, deltaTIncrementSquared, i){
				
				if(body.previousPosition){
					beginPos.copy(body.position);
					body.force.multiplyScalar(body.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					body.force.multiplyScalar(deltaTIncrementSquared);
					workVect.copy(body.position).sub(body.previousPosition);
					body.position.add(workVect);
					body.position.add(body.force);/**/
					body.previousPosition.copy(beginPos);
					
				} else {//initialisation (with Euler algorithm)
					body.previousPosition = body.position.clone();
					workVect = new THREE.Vector3();
					body.force.multiplyScalar(body.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					body.force.multiplyScalar(deltaTIncrement);
					body.velocity.add(body.force);
					var correctedVel = body.velocity.clone();
					correctedVel.multiplyScalar(deltaTIncrement);//speed needs to take deltaT into account
					body.position.add(correctedVel);
				}

				body.force.x = body.force.y = body.force.z = 0;//reset force
			}
		};

		return Verlet;

	}
);
