define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
		'use strict';


		var RungeKutta = {
			name : 'Runge-Kutta',
			moveBody : function(body, deltaTIncrement, deltaTIncrementSquared, i){
				
				var accel = body.force.clone().multiplyScalar(body.invMass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
				//body.force.multiplyScalar(deltaTIncrementSquared);

				var delta = deltaTIncrement/4;
				for(var i=0; i<4; i++){
					var pos1 = body.getPosition();
					var vel1 = body.getVelocity();
				 
					var pos2 = body.getPosition().add(vel1.clone().multiplyScalar(0.5*delta));
					var vel2 = body.getVelocity().add(accel.clone().multiplyScalar(0.5*delta));
				 
					var pos3 = body.getPosition().add(vel2.clone().multiplyScalar(0.5*delta));
					var vel3 = body.getVelocity().add(accel.clone().multiplyScalar(0.5*delta));
				 
					var pos4 = body.getPosition().add(vel3.clone().multiplyScalar(delta));
					var vel4 = body.getVelocity().add(accel.clone().multiplyScalar(delta));
				 
					body.position.add(vel1.add(vel2.multiplyScalar(2)).add(vel3.multiplyScalar(2)).add(vel4).multiplyScalar(delta/6));
					body.velocity.add(accel.clone().add(accel.clone().multiplyScalar(2)).add(accel.clone().multiplyScalar(2)).add(accel).multiplyScalar((delta/6)));
				}

				body.force.x = body.force.y = body.force.z = 0;//reset force
			}
		};

		return RungeKutta;

	}
);
