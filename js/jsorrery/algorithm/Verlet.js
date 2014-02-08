define(
	[
		'jsorrery/NameSpace',
		'jsorrery/algorithm/MoveAlgorithm',
		'jsorrery/algorithm/Gravity'
	],
	function(ns, MoveAlgorithm, Gravity) {
		'use strict';
		var beginPos = new THREE.Vector3();
		var workVect = new THREE.Vector3();

		var moveBody = function(body, deltaT, deltaTSq, i){

			if(body.previousPosition){
				beginPos.copy(body.position);
				body.force.multiplyScalar(body.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
				body.force.multiplyScalar(deltaTSq);
				workVect.copy(body.position).sub(body.previousPosition);
				body.position.add(workVect);
				body.position.add(body.force);/**/
				body.previousPosition.copy(beginPos);
				
			} else {//initialisation (with Euler algorithm)
				body.previousPosition = body.position.clone();
				workVect = new THREE.Vector3();
				body.force.multiplyScalar(body.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
				body.force.multiplyScalar(deltaT);
				body.velocity.add(body.force);
				var correctedVel = body.getVelocity();
				correctedVel.multiplyScalar(deltaT);//speed needs to take deltaT into account
				body.position.add(correctedVel);
			}

			body.force.x = body.force.y = body.force.z = 0;//reset force
		};


		var Verlet = Object.create(MoveAlgorithm);

		Verlet.name = 'Verlet';	
		
		Verlet.moveBodies = function(epochTime, deltaT) {
			this.computeDeltaT(deltaT);

			Gravity.calculateGForces(this.bodies);
			for(var i=0; i<this.bodies.length; i++){
				this.bodies[i].beforeMove(deltaT);
				if(this.bodies[i].calculateFromElements){
					this.bodies[i].setPositionFromDate(epochTime + deltaT, false);
				} else if(!this.bodies[i].isStill){
					moveBody(this.bodies[i], deltaT, this.deltaTSq, i);
				}
				this.bodies[i].afterMove(deltaT);
			}
		};

		return Verlet;

	}
);
