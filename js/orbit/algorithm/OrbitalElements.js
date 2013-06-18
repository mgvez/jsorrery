
define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {

		var maxIterationsForEccentricAnomaly = 10;
		var maxDeltaTForVelocity = 3600;//seconds
		var maxDE = 1e-15;

		var Deg ={
			sin : function(v) {
				return Math.sin(v * ns.DEG_TO_RAD);
			},
			cos : function(v) {
				return Math.cos(v * ns.DEG_TO_RAD);
			},
			atan2 : function(y, x) {
				return Math.atan2(y, x) * ns.RAD_TO_DEG;
			},
			acos : function(x) {
				return Math.acos(x) * ns.RAD_TO_DEG;
			}
		};

		return {
			calculateVelocity : function(timeEpoch) {
				if(!this.orbit) return new THREE.Vector3(0,0,0);
				//vis viva to calculate speed (not velocity, i.e not a vector)
				var el = this.calculateElements(timeEpoch);
				var speed = Math.sqrt(ns.G * ns.U.getBody(this.relativeTo).mass * ((2 / (el.r)) - (1 / (el.a))));

				//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
				var k = el.r / el.a;
				var alpha = Math.acos(((2 - (2 * el.e * el.e)) / (k * (2-k)))-1);
				alpha = el.v < 0 ? (2*Math.PI) - alpha  : alpha;
				var velocityAngle = el.v + ((Math.PI - alpha) /  2);

				//default orbit is counterclockwise
				var dir = (this.orbit.cy && this.orbit.cy.M) || (this.orbit.day && this.orbit.day.M);
				var isInversed = dir && dir < 0 ? true : false;/**/
				velocityAngle = (el.v < 0) != isInversed ? Math.PI + velocityAngle  : velocityAngle;

				//velocity vector in the plane of the orbit
				var orbitalVelocity = new THREE.Vector3(Math.cos(velocityAngle), Math.sin(velocityAngle)).setLength(speed);
				var velocityEls = $.extend({}, el, {pos:orbitalVelocity, v:null, r:null});
    			var eclipticVelocity = this.getPositionFromElements(velocityEls);

				return eclipticVelocity;
			},

			calculatePosition : function(timeEpoch) {
				if(!this.orbit) return new THREE.Vector3(0,0,0);
				var computed = this.calculateElements(timeEpoch);
				var pos =  this.getPositionFromElements(computed);
				return pos;
			},

			calculateElements : function(timeEpoch) {
				if(!this.orbit) return null;
				/*
	
				Epoch : J2000

				a 	Semi-major axis
			    e 	Eccentricity (rad)
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

				var tDays = timeEpoch / ns.DAY;
				var T = tDays / ns.CENTURY ;
				//console.log(T);
				var computed = {
					t : timeEpoch
				};

				var oe;
				if(this.osculatingOrbit) {
					oe = this.osculatingOrbit(T);
					$.extend(computed, oe);
					//console.log(oe);
				} else {

					if (this.orbit.base) {
						for(var el in this.orbit.base) {
							//cy : variation by century.
							//day : variation by day.
							var variation = this.orbit.cy ? this.orbit.cy[el] : (this.orbit.day[el] * ns.CENTURY);
							computed[el] = this.orbit.base[el] + (variation * T);
						}
					} else {
						computed = $.extend({}, this.orbit);
					}

					if (undefined === computed.w) {
						computed.w = computed.lp - computed.o;
					}

					if (undefined === computed.M) {
						computed.M = computed.l - computed.lp;
					}

					computed.a = computed.a * 1000;//was in km, set it in m
				}

				var ePrime = ns.RAD_TO_DEG * computed.e;
				computed.E = computed.M + ePrime * Deg.sin(computed.M) * (1 + computed.e * Deg.cos(computed.M));

				var En = computed.E;
				var dE = 0;
				var dM;
				var i = 0;
				do{
					En = En + dE;
					dM = computed.M - (En - ePrime * Deg.sin(En));
					dE = dM / (1 - (computed.e * Deg.cos(En)));
					i++;
				} while(Math.abs(dE) > maxDE && i <= maxIterationsForEccentricAnomaly);

				computed.E = En % 360;
				computed.i = computed.i % 360;
				computed.o = computed.o % 360;
				computed.w = computed.w % 360;
				computed.M = computed.M % 360;
				computed.i = ns.DEG_TO_RAD * computed.i;
				computed.o = ns.DEG_TO_RAD * computed.o;
				computed.w = ns.DEG_TO_RAD * computed.w;
				computed.M = ns.DEG_TO_RAD * computed.M;
				computed.E = ns.DEG_TO_RAD * computed.E;

				//in the plane of the orbit
				computed.pos = new THREE.Vector3(computed.a * (Math.cos(computed.E) - computed.e), computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * Math.sin(computed.E));

				computed.r = computed.pos.length();
    			computed.v = Math.atan2(computed.pos.y, computed.pos.x);

				return computed;
			},

			getPositionFromElements : function(computed) {

				if(!computed) return new THREE.Vector3(0,0,0);
				computed.r = computed.r !== null ? computed.r : computed.pos.length();
    			computed.v = computed.v !== null ? computed.v : Math.atan2(computed.pos.y, computed.pos.x);

    			var x = computed.r * ( Math.cos(computed.o) * Math.cos(computed.v+computed.w) -
    			Math.sin(computed.o) * Math.sin(computed.v+computed.w) * Math.cos(computed.i) )
			    var y = computed.r * ( Math.sin(computed.o) * Math.cos(computed.v+computed.w) +
			     Math.cos(computed.o) * Math.sin(computed.v+computed.w) * Math.cos(computed.i) )
			    var z = computed.r * Math.sin(computed.v+computed.w) * Math.sin(computed.i);/**/

				//invert y axis for 2d canvas (0 is top left, not bottom left as in cartesian systems)
				var pos = new THREE.Vector3(x, y, z);
				return pos;
			},

			calculatePeriod : function(elements) {

				if(this.period) return;
				if(this.orbit && this.orbit.day && this.orbit.day.M) {
					this.period = 360 / this.orbit.day.M ;
				}else if(ns.U.getBody(this.relativeTo) && ns.U.getBody(this.relativeTo).k && elements) {
					this.period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a/(ns.AU*1000), 3)) / ns.U.getBody(this.relativeTo).k;
				}
				this.period = this.period * ns.DAY;//in seconds
			}
		};
	}
);

