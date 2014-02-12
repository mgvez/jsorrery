
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/helpers/Math',
		'three'
	],
	function(ns, $, CMath) {
		'use strict';
		var maxIterationsForEccentricAnomaly = 10;
		var maxDE = 1e-15;

		var solveEccentricAnomaly = function(f, x0, maxIter) {
				
			var x = 0;
			var x2 = x0;
			
			for (var i = 0; i < maxIter; i++) {
				x = x2;
				x2 = f(x);
			}
			
			return x2;
		}

		var solveKepler = function(e, M) {
			return function(x) {
				return x + (M + e * Math.sin(x) - x) / (1 - e * Math.cos(x));
			};
		};

		var solveKeplerLaguerreConway = function(e, M) {
			return function(x) {
				var s = e * Math.sin(x);
				var c = e * Math.cos(x);
				var f = x - s - M;
				var f1 = 1 - c;
				var f2 = s;

				x += -5 * f / (f1 + CMath.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
				return x;
			};
		};

		var solveKeplerLaguerreConwayHyp = function(e, M) {
			return function(x) {
				var s = e * CMath.sinh(x);
				var c = e * CMath.cosh(x);
				var f = x - s - M;
				var f1 = c - 1;
				var f2 = s;

				x += -5 * f / (f1 + CMath.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
				return x;
			};
		};

		return {
			setDefaultOrbit : function(orbitalElements, calculator) {
				this.orbitalElements = orbitalElements;
				if(orbitalElements && orbitalElements.epoch) {
					this.epochCorrection = ns.U.getEpochTime(orbitalElements.epoch);
				}
				this.calculator = calculator;
			},

			setName : function(name){
				this.name = name;
			},

			calculateVelocity : function(timeEpoch, relativeTo, isFromDelta) {
				if(!this.orbitalElements) return new THREE.Vector3(0,0,0);

				var eclipticVelocity;
				
    			if ( isFromDelta ) {
	    			var pos1 = this.calculatePosition(timeEpoch);
    				var pos2 = this.calculatePosition(timeEpoch + 60);
    				eclipticVelocity = pos2.sub(pos1).multiplyScalar(1/60);
    			} else {
    				//vis viva to calculate speed (not velocity, i.e not a vector)
					var el = this.calculateElements(timeEpoch);
					var speed = Math.sqrt(ns.G * ns.U.getBody(relativeTo).mass * ((2 / (el.r)) - (1 / (el.a))));

					//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
					var k = el.r / el.a;
					var o = ((2 - (2 * el.e * el.e)) / (k * (2-k)))-1;
					//floating point imprecision
					o = o > 1 ? 1 : o;
					var alpha = Math.PI - Math.acos(o);
					alpha = el.v < 0 ? (2 * Math.PI) - alpha  : alpha;
					var velocityAngle = el.v + (alpha / 2);
					//velocity vector in the plane of the orbit
					var orbitalVelocity = new THREE.Vector3(Math.cos(velocityAngle), Math.sin(velocityAngle)).setLength(speed);
					var velocityEls = $.extend({}, el, {pos:orbitalVelocity, v:null, r:null});
	    			eclipticVelocity = this.getPositionFromElements(velocityEls);
    			}

    			//var diff = eclipticVelocityFromDelta.sub(eclipticVelocity);console.log(diff.length());
    			return eclipticVelocity;
				
			},

			calculatePosition : function(timeEpoch) {
				if(!this.orbitalElements) return new THREE.Vector3(0,0,0);
				var computed = this.calculateElements(timeEpoch);
				var pos =  this.getPositionFromElements(computed);
				return pos;
			},

			solveEccentricAnomaly : function(e, M){
				if (e == 0.0) {
					return M;
				}  else if (e < 0.9) {
					var sol = solveEccentricAnomaly(solveKepler(e, M), M, 6);
					return sol;
				} else if (e < 1.0) {
					var E = M + 0.85 * e * ((Math.sin(M) >= 0.0) ? 1 : -1);
					var sol = solveEccentricAnomaly(solveKeplerLaguerreConway(e, M), E, 8);
					return sol;
				} else if (e == 1.0) {
					return M;
				} else {
					var E = Math.log(2 * M / e + 1.85);
					var sol = solveEccentricAnomaly(solveKeplerLaguerreConwayHyp(e, M), E, 30);
					return sol;
				}
			},

			calculateElements : function(timeEpoch, forcedOrbitalElements) {
				if(!forcedOrbitalElements && !this.orbitalElements) return null;

				var orbitalElements = forcedOrbitalElements || this.orbitalElements;

				/*
	
				Epoch : J2000

				a 	Semi-major axis
			    e 	Eccentricity
			    i 	Inclination
			    o 	Longitude of Ascending Node (Ω)
			    w 	Argument of periapsis (ω)
				E 	Eccentric Anomaly
			    T 	Time at perihelion
			    M	Mean anomaly
			    l 	Mean Longitude
			    lp	longitude of periapsis
			    r	distance du centre
			    v	true anomaly

			    P	Sidereal period (mean value)
				Pw	Argument of periapsis precession period (mean value)
				Pn	Longitude of the ascending node precession period (mean value)

			    */
			    if (this.epochCorrection) {
			    	timeEpoch -= this.epochCorrection;
			    }
				var tDays = timeEpoch / ns.DAY;
				var T = tDays / ns.CENTURY ;
				//console.log(T);
				var computed = {
					t : timeEpoch
				};

				if(this.calculator && !forcedOrbitalElements) {
					var realorbit = this.calculator(T);
					$.extend(computed, realorbit);
				} else {

					if (orbitalElements.base) {
						var variation;
						for(var el in orbitalElements.base) {
							//cy : variation by century.
							//day : variation by day.
							variation = orbitalElements.cy ? orbitalElements.cy[el] : (orbitalElements.day[el] * ns.CENTURY);
							variation = variation || 0;
							computed[el] = orbitalElements.base[el] + (variation * T);
						}
					} else {
						computed = $.extend({}, orbitalElements);
					}

					if (undefined === computed.w) {
						computed.w = computed.lp - computed.o;
					}

					if (undefined === computed.M) {
						computed.M = computed.l - computed.lp;
					}

					computed.a = computed.a * ns.KM;//was in km, set it in m
				}


				computed.i = ns.DEG_TO_RAD * computed.i;
				computed.o = ns.DEG_TO_RAD * computed.o;
				computed.w = ns.DEG_TO_RAD * computed.w;
				computed.M = ns.DEG_TO_RAD * computed.M;

				computed.E = this.solveEccentricAnomaly(computed.e, computed.M);

				computed.E = computed.E % ns.CIRCLE;
				computed.i = computed.i % ns.CIRCLE;
				computed.o = computed.o % ns.CIRCLE;
				computed.w = computed.w % ns.CIRCLE;
				computed.M = computed.M % ns.CIRCLE;

				//in the plane of the orbit
				computed.pos = new THREE.Vector3(computed.a * (Math.cos(computed.E) - computed.e), computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * Math.sin(computed.E));

				computed.r = computed.pos.length();
    			computed.v = Math.atan2(computed.pos.y, computed.pos.x);
    			if(orbitalElements.relativeTo) {
    				var relativeTo = ns.U.getBody(orbitalElements.relativeTo);
    				if(relativeTo.tilt) {
    					computed.tilt = -relativeTo.tilt * ns.DEG_TO_RAD;
    				}
    			};
				return computed;
			},

			getPositionFromElements : function(computed) {

				if(!computed) return new THREE.Vector3(0,0,0);

				var a1 = new THREE.Euler(computed.tilt || 0, 0, computed.o, 'XYZ');
				var q1 = new THREE.Quaternion().setFromEuler(a1);
				var a2 = new THREE.Euler(computed.i, 0, computed.w, 'XYZ');
				var q2 = new THREE.Quaternion().setFromEuler(a2);

				var planeQuat = new THREE.Quaternion().multiplyQuaternions(q1, q2);
				computed.pos.applyQuaternion(planeQuat);
				return computed.pos;
			},

			calculatePeriod : function(elements, relativeTo) {
				var period;
				if(this.orbitalElements && this.orbitalElements.day && this.orbitalElements.day.M) {
					period = 360 / this.orbitalElements.day.M ;
				}else if(ns.U.getBody(relativeTo) && ns.U.getBody(relativeTo).k && elements) {
					period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a/(ns.AU*1000), 3)) / ns.U.getBody(relativeTo).k;
				}
				period *= ns.DAY;//in seconds
				return period;
			}
		};
	}
);

