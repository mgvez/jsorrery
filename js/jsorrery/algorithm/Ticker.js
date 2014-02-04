define(
	[
		'jsorrery/NameSpace',
		'jsorrery/algorithm/Gravity',
		'jsorrery/algorithm/Verlet',
		'jsorrery/algorithm/Quadratic',
		'three',
		'_'
	],
	function(ns, Gravity, MoveByVerlet, Quadratic) {
		'use strict';
		/**
		number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position.
		*/

		var calculationsPerTick = 1;
		var secondsPerTick = 1;
		var deltaTIncrement = 1;
		var deltaTIncrementSquared = 1;
		var bodies = [];
		
		var setDT = function (){
			if(!calculationsPerTick || !secondsPerTick) return;
			deltaTIncrement = secondsPerTick / calculationsPerTick;
			deltaTIncrementSquared = Math.pow(deltaTIncrement, 2);
		};
		
		var moveByGravity = function(epochTime){
			var t, i;
			//We calculate the positions of all bodies, and thus the gravity, more than once per tick. Not efficient but more precise than approximating the whole forces to their value at the beginning of the cycle.
			for(t=0; t < calculationsPerTick; t++){
				Quadratic.moveBodies(epochTime + (t * deltaTIncrement), deltaTIncrement);
			}

			return;/**/
			for(t=0; t < calculationsPerTick; t++){
				Gravity.calculateGForces(bodies);
				for(i=0; i<bodies.length; i++){
					bodies[i].beforeMove(deltaTIncrement);
					if(bodies[i].calculateFromElements && false){
						bodies[i].setPositionFromDate(epochTime + (deltaTIncrement*(t+1)), false);
					} else if(!bodies[i].isStill){
						MoveByVerlet.moveBody(bodies[i], deltaTIncrement, deltaTIncrementSquared, i);
					}
					bodies[i].afterMove(deltaTIncrement);
				}
			}
		};
		var printed = false;
		var moveByElements = function(epochTime){
			if(!printed) {
					console.log('Elements');
					printed = true;
				}
			for(var i=0; i<bodies.length; i++){
				bodies[i].setPositionFromDate(epochTime, false);
			}
		}

		var Algorithm = {
			
			tick : function(computePhysics, epochTime){
				if(computePhysics){
					moveByGravity(epochTime - secondsPerTick);
				} else {
					moveByElements(epochTime);
				}

				for(var i=0; i<bodies.length; i++){
					bodies[i].afterTick(secondsPerTick, !computePhysics);
				}/**/
				
				return secondsPerTick;
			},
			
			setBodies : function(b){
				bodies.length = 0;
				_.each(b, function(body, name){
					bodies.push(body);
				});
				Quadratic.setBodies(bodies);
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