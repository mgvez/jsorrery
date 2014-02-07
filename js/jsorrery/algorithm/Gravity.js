define(
	[
		'jsorrery/NameSpace',
		'three',
		'_'
	],
	function(ns) {
		'use strict';
		
		return {
			/**
			Calculates the forces that are created by each body toward one another
			*/
			calculateGForces : function(bodies){
				var workVect=new THREE.Vector3(), i, j;
				for(i=0; i<bodies.length; i++){
					if(!i) bodies[i].force.x = bodies[i].force.y = bodies[i].force.z = 0;
					for(j=i+1; j<bodies.length; j++){
						if(!i) bodies[j].force.x = bodies[j].force.y = bodies[j].force.z = 0;
						if(
							(bodies[i].mass === 1 && bodies[j].mass === 1)
							||
							(bodies[i].calculateFromElements && bodies[j].calculateFromElements) 
						) continue; 
						workVect = this.getGForceBetween(bodies[i].mass, bodies[j].mass, bodies[i].position, bodies[j].position);
						//add forces (for the first body, it is the reciprocal of the calculated force)
						bodies[i].force.sub(workVect);
						bodies[j].force.add(workVect);/**/
					}
				}
			},
			/**
			Get the gravitational force in Newtons between two bodies (their distance in m, mass in kg)
			*/
			getGForceBetween : function(mass1, mass2, pos1, pos2){
				var workVect=new THREE.Vector3(), dstSquared, massPrd, Fg;
				workVect.copy(pos1).sub(pos2);//vector is between positions of body A and body B
				dstSquared = workVect.lengthSq();
				massPrd = mass1 * mass2;
				Fg = ns.G * (massPrd / dstSquared);//in newtons (1 N = 1 kg*m / s^2)
				workVect.normalize();
				workVect.multiplyScalar(Fg);//vector is now force of attraction in newtons/**/
				return workVect;
			}
		};

	}
);
