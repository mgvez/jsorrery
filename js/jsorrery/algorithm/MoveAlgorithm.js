define(
	[

	],

	function() {

		return {
			init : function(bodies){
				console.log(this.name);
				var algo = Object.create(this);
				algo.bodies = bodies;
				return algo;
			},

			moveBodies : function(epochTime, deltaT){
				console.log('Move function undefined');
			},

			//precompute all variations of deltaT, only if it changed since last pass
			computeDeltaT : function(deltaT) {

				if(deltaT !== this.lastDeltaT) {
					this.halfDeltaT = deltaT / 2;
					this.halfDeltaTSq = Math.pow(this.halfDeltaT, 2);
					this.onehalf_halfDeltaTSq = this.halfDeltaTSq / 2;
					this.deltaTSq = Math.pow(deltaT, 2);
					this.onehalf_deltaTSq = this.deltaTSq / 2;
					this.inverted_deltaTSq = 1/this.deltaTSq;
					this.deltaT3rd = Math.pow(deltaT, 3);
					this.onethird_deltaT3rd = this.deltaT3rd/3;
					this.onesixth_deltaT3rd = this.deltaT3rd/6;
					this.deltaT4th = Math.pow(deltaT, 4);
					this.onetwelvth_deltaT4th = this.deltaT4th/12;
				}

				this.lastDeltaT = deltaT;
			}
		};

	}
);