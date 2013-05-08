define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
		
		/**
		number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position.
		*/

		var precision = 1;
		var secondsPerTick = 1;
		var deltaTIncrement = 1;
		var bodies;

		/**
		Calculates the forces that are created by each body toward one another
		*/
		var calculateGForces = function(){
			var workVect;
			for(var i=0; i<bodies.length; i++){
				//loop in following bodies and calculate forces between them and this one. No need to do previous ones, as they were done in previous iterations
				for(var j=i+1; j<bodies.length; j++){
					workVect = getGForceBetween(bodies[i], bodies[j]);
					//add forces (for the first body, it is the reciprocal of the calculated force)
					bodies[i].force.sub(workVect);
					bodies[j].force.add(workVect);
				}
			}
			
		};

		/**
		Get the gravitational force in Newtons between two bodies (their distance in m, mass in kg)
		*/
		var getGForceBetween = function(a, b){
			var workVect = a.position.clone().sub(b.position);//vector is between positions of body A and body B
			var dstSquared = workVect.lengthSq();
			var massPrd = a.mass * b.mass;
			var Fg = ns.G * (massPrd / dstSquared);//in newtons (1 N = 1 kg*m / s^2)
			workVect.normalize();
			workVect.multiplyScalar(Fg);//vector is now force of attraction in newtons
			return workVect;
		};
		
		setDT = function (){
			if(!precision || !secondsPerTick) return;
			deltaTIncrement = secondsPerTick / precision;
		};

		var Algorithm = {
			
			tick : function(){
				//We calculate the positions of all bodies, and thus the gravity, more than once per tick. Not efficient but more precise than approximating the whole forces to their value at the beginning of the cycle.
				var t = 0;
				while(t < precision){
					calculateGForces();
					for(var i=0; i<bodies.length; i++){
						bodies[i].moveBody(deltaTIncrement, t == precision-1);
					}
					t++;
				}
				for(var i=0; i<bodies.length; i++){
					bodies[i].drawMove();
				}
				return secondsPerTick;
			},
			
			
			setBodies : function(b){
				bodies = b;
			},
			
			setPrecision : function(p){
				precision = p;
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