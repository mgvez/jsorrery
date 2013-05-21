
define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {


		var degToRad = Math.PI/180;
		var radToDeg = 180/Math.PI;

		var maxIterationsForEccentricAnomaly = 10;
		var maxDeltaTForVelocity = 3600;//seconds
		var maxDE = 1e-15;

		var Deg ={
			sin : function(v) {
				return Math.sin(v * degToRad);
			},
			cos : function(v) {
				return Math.cos(v * degToRad);
			},
			atan2 : function(y, x) {
				return Math.atan2(y, x) * radToDeg;
			},
			acos : function(x) {
				return Math.acos(x) * radToDeg;
			}
		};

		return {
			calculateVelocity : function(timeEpoch) {
				
				if (!this.orbit) return new THREE.Vector3(0, this.speed * 1000, 0);//velocity is set in km/s, we need it in m/s;
				
				var els = [];
				/*

				var halfMaxDeltaTForVelocity = maxDeltaTForVelocity / 2;
				var i = 1;
				var j;
				var t;
				var tSign;
				while(i < halfMaxDeltaTForVelocity && (!els[0] || !els[1])){
					for(var j=0; j<=1; j++){
						tSign = j * -2 + 1;
						t = timeEpoch + tSign * i;
						els[j] = els[j] || this.calculateElements(t);
					}
					i++;
				}/**/

				els[0] = this.calculateElements(timeEpoch+1);
				els[1] = this.calculateElements(timeEpoch-1);

				var t0Pos = this.getPositionFromElements(els[1]);
				var t1Pos = this.getPositionFromElements(els[0]);
				var velocityFromDelta = new THREE.Vector3();
				velocityFromDelta.subVectors(t1Pos, t0Pos);
				var deltaT = 1/Math.round(els[0].t - els[1].t);
				velocityFromDelta.multiplyScalar(deltaT);
				/**/
				//vis viva to calculate speed (not velocity, i.e not a vector)
				var el = this.calculateElements(timeEpoch);
				var speed = Math.sqrt(ns.G * ns.U.centralBody.mass * ((2 / (el.r)) - (1 / (el.a))));
				//console.log(velocity.length(), speed);

				//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
				var k = el.r / el.a;
				var alpha = Math.acos(((2 - (2 * el.e * el.e)) / (k * (2-k)))-1);

				var velocityAngle = degToRad * el.v + (Math.PI - alpha) /  2;

				var xPlane = Math.cos(velocityAngle);
				var yPlane = Math.sin(velocityAngle);



				var velocityEls = $.extend(el, {
					r : Math.sqrt(xPlane*xPlane + yPlane*yPlane),
    				v : Deg.atan2(yPlane, xPlane)
    			});

    			var velocity = this.getPositionFromElements(velocityEls);
				velocity.multiplyScalar(speed);
				console.log(this.name);
				
				var master = new THREE.Vector3(xPlane, yPlane, 0);
				

				$.each(['x','y','z','length'], function(i, attr){
					
					var fromDelta = velocityFromDelta[attr];
					var fromVV = velocity[attr];
					if(typeof velocity[attr] == 'function'){
						fromDelta = velocityFromDelta[attr]();
						fromVV = velocity[attr]();
					}
					var absVar = fromDelta - fromVV;
					var prcVar = ((absVar) / fromDelta) * 100;
					if(prcVar > 0.01) {
						console.log(deltaT);
						console.log(master.length());
						console.log(attr, absVar, prcVar);
					}
				});

				//return velocityFromDelta;
				return velocity;
			},

			calculatePosition : function(timeEpoch) {
				//position is set in KM, we need it in m;
				if (!this.orbit) return new THREE.Vector3(this.dist, 0, 0);

				var computed = this.calculateElements(timeEpoch);
				var pos =  this.getPositionFromElements(computed);

				return pos;//position is set in KM, we need it in m
				
			},

			calculateElements : function(timeEpoch) {
				/*
	
				Epoch : J2000

				a 	Semi-major axis
			    e 	Eccentricity (rad)
			    i 	Inclination
			    N 	Longitude of Ascending Node (Omega)
			    w 	Argument of periapsis
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

				var tDays = timeEpoch / ns.day;
				var T = tDays / ns.century ;
				//console.log(T);
				var computed = {
					t : timeEpoch
				};

				if (this.orbit.base) {
					for(var el in this.orbit.base) {
						//cy : variation by century.
						//day : variation by day.
						var variation = this.orbit.cy ? this.orbit.cy[el] : (this.orbit.day[el] * ns.century);
						computed[el] = this.orbit.base[el] + (variation * T);
					}
				} else {
					computed = this.orbit;
				}

				if (undefined === computed.w) {
					computed.w = computed.lp - computed.N;
				}

				if (undefined === computed.M) {
					computed.M = computed.l - computed.lp;
				}

				computed.a = computed.a * 1000;//was in km, ets it in m

				var ePrime = radToDeg * computed.e;
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

				//in the plane of the orbit
				computed.xPlane = computed.a * (Deg.cos(computed.E) - computed.e);
				computed.yPlane = computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * Deg.sin(computed.E);

				computed.r = Math.sqrt(computed.xPlane*computed.xPlane + computed.yPlane*computed.yPlane);
    			computed.v = Deg.atan2(computed.yPlane, computed.xPlane);

				this.calculatePeriod(computed);

				return computed;
			},

			getPositionFromElements : function(computed) {

    			var x = computed.r * ( Deg.cos(computed.N) * Deg.cos(computed.v+computed.w) -
    			Deg.sin(computed.N) * Deg.sin(computed.v+computed.w) * Deg.cos(computed.i) )
			    var y = computed.r * ( Deg.sin(computed.N) * Deg.cos(computed.v+computed.w) +
			     Deg.cos(computed.N) * Deg.sin(computed.v+computed.w) * Deg.cos(computed.i) )
			    var z = computed.r * Deg.sin(computed.v+computed.w) * Deg.sin(computed.i);/**/
 
				//invert y axis for 2d canvas (0 is top left, not bottom left as in cartesian systems)
				var pos = new THREE.Vector3(x, -y, z);

				return pos;
			},

			calculatePeriod : function(elements) {
				if(this.period || !ns.U.centralBody || !ns.U.centralBody.k) return;

				this.period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a/(ns.AU*1000), 3)) / ns.U.centralBody.k;
			}
		};
	}
);

