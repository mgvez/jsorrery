define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
		'use strict';
		var beginPos = new THREE.Vector3();

		//xi+1 = xi + (xi - xi-1) + a * dt * dt

		var Verlet = {
			setBody : function(b){
				this.b = b;
			},
			moveBody : function(deltaTIncrement, i){
				
				if(this.previousPosition){
					beginPos.copy(this.b.position);
					this.b.force.multiplyScalar(this.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.b.force.multiplyScalar(deltaTIncrement * deltaTIncrement);
					this.workVect.copy(this.b.position).sub(this.previousPosition);
					this.b.position.add(this.workVect);
					this.b.position.add(this.b.force);/**/
					this.previousPosition.copy(beginPos);
					
				} else {//initialisation (with Euler algorithm)
					this.previousPosition = this.b.position.clone();
					this.workVect = new THREE.Vector3();
					this.invMass = 1 / this.b.mass;
					this.b.force.multiplyScalar(this.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.b.force.multiplyScalar(deltaTIncrement);
					this.b.velocity.add(this.b.force);
					var correctedVel = this.b.velocity.clone();
					correctedVel.multiplyScalar(deltaTIncrement);//speed needs to take deltaT into account
					this.b.position.add(correctedVel);
				}

				this.b.force.x = this.b.force.y = this.b.force.z = 0;//reset force
				//this.b.afterMove(ns.U.epochTime + (deltaTIncrement * i));
			}
		};

		return Verlet;

	}
);
