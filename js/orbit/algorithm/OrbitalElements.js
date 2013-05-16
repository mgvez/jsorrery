
define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {


		var degToRad = Math.PI/180;
		var radToDeg = 180/Math.PI;

		var maxIterationsForEccentricAnomaly = 20;
		var maxDeltaTForVelocity = 3600;//seconds
		var maxDE = 1e-19;

		var DegMath ={
			sin : function(v) {
				return Math.sin(v * degToRad);
			},
			cos : function(v) {
				return Math.cos(v * degToRad);
			}
		};

		return {
			calculateVelocity : function(timeEpoch) {
				
				if (!this.orbit) return new THREE.Vector3(0, this.speed * 1000, 0);//velocity is set in km/s, we need it in m/s;

				var halfMaxDeltaTForVelocity = maxDeltaTForVelocity / 2;
				var i = 1;
				var j;
				var t;
				var tSign;
				var els = [];
				while(i < halfMaxDeltaTForVelocity && (!els[0] || !els[1])){
					for(var j=0; j<=1; j++){
						tSign = j * -2 + 1;
						t = timeEpoch + tSign * i;
						els[j] = els[j] || this.calculateElements(t, true);
					}
					i++;
				}

				els[0] = els[0] || this.calculateElements(timeEpoch-halfMaxDeltaTForVelocity);
				els[1] = els[1] || this.calculateElements(timeEpoch+halfMaxDeltaTForVelocity);

				var t0Pos = this.getPositionFromElements(els[1]);
				var t1Pos = this.getPositionFromElements(els[0]);
				var velocity = new THREE.Vector3();
				velocity.subVectors(t1Pos, t0Pos);
				velocity.multiplyScalar(1/Math.round(els[0].t - els[1].t));
				console.log(this.name, i, (els[0].t - els[1].t), this.speed, velocity.length());
				return velocity;
			},

			calculatePosition : function(timeEpoch) {
				//position is set in KM, we need it in m;
				if (!this.orbit) return new THREE.Vector3(this.dist * 1000, 0, 0);

				var computed = this.calculateElements(timeEpoch);
				var pos =  this.getPositionFromElements(computed);

				return pos;//position is set in KM, we need it in m
				
			},

			calculateElements : function(timeEpoch, forVelocity) {
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


				//var T = (timeEpoch-2451545) / ns.century ;
				var tDays = timeEpoch / ns.day;
				var T = tDays / ns.century ;

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
				//computed.M = computed.L - computed.lp + (b * (T*T)) + (c * DegMath.cos(f * T)) + (s * DegMath.sin(f * T));
				if (undefined === computed.M) {
					computed.M = computed.l - computed.lp;
				}

				computed.M = (((computed.M % 360 ) + 360 ) % 360) - 180;


				var ePrime = (180/Math.PI) * computed.e;
				computed.E = computed.M + ePrime * DegMath.sin(computed.M) * (1 + computed.e * DegMath.cos(computed.M));

				var En = computed.E;
				var dE;
				var dM;
				var i = 0;
				do{
					dM = computed.M - (En - ePrime * DegMath.sin(En));
					dE = dM / (1 - (computed.e * DegMath.cos(En)));
					En = En + dE;
					i++;
				} while(dE > maxDE && i <= maxIterationsForEccentricAnomaly);

				if(dE > maxDE && forVelocity){
					return false;
				}

				computed.E = En;

				//in the plane of the orbit
				computed.xPlane = computed.a * (DegMath.cos(computed.E) - computed.e);
				computed.yPlane = computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * DegMath.sin(computed.E);/**/

				computed.r = Math.sqrt(computed.xPlane*computed.xPlane + computed.yPlane*computed.yPlane);
    			computed.v = Math.atan2(computed.yPlane, computed.xPlane) * radToDeg;

    			/*if(!this.hasLoggedPos) {
	    			console.log(this.name+'	'+computed.N+'	'+computed.i+'	'+computed.w+'	'+computed.a+'	'+computed.e+'	'+(((computed.M%360)+360)%360));
	    			this.hasLoggedPos=true;
	    		}/**/
				this.calculatePeriod(computed);

				return computed;
			},

			getPositionFromElements : function(computed) {

    			var x = computed.r * ( DegMath.cos(computed.N) * DegMath.cos(computed.v+computed.w) - DegMath.sin(computed.N) * DegMath.sin(computed.v+computed.w) * DegMath.cos(computed.i) )
			    var y = computed.r * ( DegMath.sin(computed.N) * DegMath.cos(computed.v+computed.w) + DegMath.cos(computed.N) * DegMath.sin(computed.v+computed.w) * DegMath.cos(computed.i) )
			    var z = computed.r * DegMath.sin(computed.v+computed.w) * DegMath.sin(computed.i)

				//console.dir(computed);
				//var pos = new THREE.Vector3(computed.xPlane * ns.AU * 1000, computed.yPlane * ns.AU * 1000, 0);
				var pos = new THREE.Vector3(x * ns.AU * 1000, y * ns.AU * 1000, z * ns.AU * 1000);

				return pos;
			},

			calculatePeriod : function(elements) {
				if(this.period || !ns.U.centralBody || !ns.U.centralBody.k) return;

				this.period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a, 3)) / ns.U.centralBody.k;
			}
		};
	}
);