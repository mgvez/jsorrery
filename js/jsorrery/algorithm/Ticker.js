define(
	[
		'jsorrery/NameSpace',
		'jsorrery/algorithm/Gravity',
		'jsorrery/algorithm/Verlet',
		'jsorrery/algorithm/Quadratic',
		'three',
		'_'
	],
	function(ns, Gravity, Verlet, Quadratic) {
		'use strict';
		/**
		number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position.
		*/

		var calculationsPerTick = 1;
		var secondsPerTick = 1;
		var deltaTIncrement = 1;
		var bodies = [];
		var moveAlgo;
		
		var setDT = function (){
			if(!calculationsPerTick || !secondsPerTick) return;
			deltaTIncrement = secondsPerTick / calculationsPerTick;
		};
		
		var moveByGravity = function(epochTime){
			for(var t=0; t < calculationsPerTick; t++){
				moveAlgo.moveBodies(epochTime + (t * deltaTIncrement), deltaTIncrement);
			}
		};

		var moveByElements = function(epochTime){
			for(var i=0; i<bodies.length; i++){
				bodies[i].setPositionFromDate(epochTime, false);
			}
		};

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
				moveAlgo = Verlet.init(bodies);
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