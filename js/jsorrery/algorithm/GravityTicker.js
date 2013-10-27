define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
		'use strict';
		/**
		number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position.
		*/

		var calculationsPerTick = 1;
		var secondsPerTick = 1;
		var deltaTIncrement = 1;
		var deltaTIncrementSquared = 1;
		var bodies = [];

		/**
		Calculates the forces that are created by each body toward one another
		*/
		var calculateGForces = function(){
			var workVect=new THREE.Vector3(), i, j;
			for(i=0; i<bodies.length; i++){
				//loop in following bodies and calculate forces between them and this one. No need to do previous ones, as they were done in previous iterations
				for(j=i+1; j<bodies.length; j++){
					if(bodies[i].mass === 1 && bodies[j].mass === 1) continue; 
					workVect = getGForceBetween(bodies[i], bodies[j]);
					//add forces (for the first body, it is the reciprocal of the calculated force)
					bodies[i].force.sub(workVect);
					bodies[j].force.add(workVect);/**/
				}
			}
		};

		/**
		Get the gravitational force in Newtons between two bodies (their distance in m, mass in kg)
		*/
		var getGForceBetween = function(a, b){
			var workVect=new THREE.Vector3(), dstSquared, massPrd, Fg;
			workVect.copy(a.position).sub(b.position);//vector is between positions of body A and body B
			dstSquared = workVect.lengthSq();
			massPrd = a.mass * b.mass;
			Fg = ns.G * (massPrd / dstSquared);//in newtons (1 N = 1 kg*m / s^2)
			workVect.normalize();
			workVect.multiplyScalar(Fg);//vector is now force of attraction in newtons/**/
			return workVect;
		};
			
		
		var setDT = function (){
			if(!calculationsPerTick || !secondsPerTick) return;
			deltaTIncrement = secondsPerTick / calculationsPerTick;
			deltaTIncrementSquared = Math.pow(deltaTIncrement, 2);
		};

		var Algorithm = {
			
			tick : function(){
				var t, i;
				//We calculate the positions of all bodies, and thus the gravity, more than once per tick. Not efficient but more precise than approximating the whole forces to their value at the beginning of the cycle.
				for(t=0; t < calculationsPerTick; t++){
					calculateGForces();
					for(i=0; i<bodies.length; i++){
						bodies[i].moveBody(deltaTIncrement, deltaTIncrementSquared, i);
					}
				}
				for(i=0; i<bodies.length; i++){
					bodies[i].afterTick(secondsPerTick);
				}/**/
				
				return secondsPerTick;
			},
			
			setBodies : function(b){
				bodies.length = 0;
				$.each(b, function(name, body){
					bodies.push(body);
				});
			},
			
			setCalculationsPerTick : function(n){
				calculationsPerTick = n || calculationsPerTick;
				setDT();
			},
			
			setSecondsPerTick : function(s) {
				secondsPerTick = s;
				setDT();
			}
		}

		return Algorithm;
	
	}
);