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
		number of calculations of gravity per tick. Adding more calculation has the effect of checking the position of bodies more often at each tick, so that the forces are not a multiplication of their values of the beginning of the tick. Since each body moves at each second, their relative position is not the same at the beginning of tick as at the end. The force they produce is'nt either. If we want to be more precise we have to "move" each body a given number of time at each tick so the forces are calculated from their new position, depending on the precision of the integration.
		*/

		var calculationsPerTick = 1;
		var actualCalculationsPerTick = 1;
		var secondsPerTick = 1;
		var deltaTIncrement = 1;
		var bodies = [];
		var integration;
		
		var setDT = function (){
			if(!calculationsPerTick || !secondsPerTick) return;
			if(secondsPerTick < calculationsPerTick) {
				actualCalculationsPerTick = secondsPerTick;
			} else {
				actualCalculationsPerTick = calculationsPerTick;
			}
			deltaTIncrement = Math.round(secondsPerTick / actualCalculationsPerTick);
			secondsPerTick = deltaTIncrement * actualCalculationsPerTick;
		};
		
		var moveByGravity = function(epochTime){
			for(var t=1; t <= actualCalculationsPerTick; t++){
				integration.moveBodies(epochTime + (t * deltaTIncrement), deltaTIncrement);
			}
		};

		var moveByElements = function(epochTime){
			for(var i=0; i<bodies.length; i++){
				bodies[i].setPositionFromDate(epochTime, false);
			}
		};

		var Ticker = {
			
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
				integration = Quadratic.init(bodies);
			},
			
			setCalculationsPerTick : function(n){
				calculationsPerTick = n || calculationsPerTick;
				setDT();
			},
			
			setSecondsPerTick : function(s) {
				secondsPerTick = s;
				setDT();
			},

			getDeltaT : function(){
				return secondsPerTick;
			}
		};

		return Ticker;
	
	}
);