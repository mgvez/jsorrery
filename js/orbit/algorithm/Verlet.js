define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
	

		var Verlet = {
			moveBody : function(deltaTIncrement, isLast){

				/*if (!this.previousPosition){
					this.previousPosition = this.calculatePosition(ns.TimeEpoch - deltaTIncrement );
				}/**/
				
				if(this.previousPosition){
					var beginPos = this.position.clone();
					
					this.force.multiplyScalar( 1 / this.mass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.force.multiplyScalar(deltaTIncrement * deltaTIncrement);
					
					var workVect = this.position.clone().sub(this.previousPosition);
					this.position.add(workVect);
					this.position.add(this.force);
					this.previousPosition = beginPos;
					
					
				} else {//initialisation (with Euler algorithm)
					this.previousPosition = this.position.clone();

					/*console.log(this.name);
					console.log(this.velocity.x, this.velocity.y, this.velocity.z);/**/
					
					this.force.multiplyScalar( 1 / this.mass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.force.multiplyScalar(deltaTIncrement);
					this.velocity.add(this.force);
					
					var correctedVel = this.velocity.clone();
					correctedVel.multiplyScalar(deltaTIncrement);//speed needs to take deltaT into account
					this.position.add(correctedVel);
				}

				this.force = new THREE.Vector3(0, 0, 0);//reset force

				if(isLast) this.afterMove();
			}
		};

		return Verlet;

	}
);
