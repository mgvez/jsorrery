
define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {


		var degToRad = Math.PI/180;
		var radToDeg = 180/Math.PI;

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

				var nextSecond = timeEpoch +  (1 / (60*60*24)) ;
				var nextSecondPosition = this.calculatePosition(nextSecond);
				var speed = nextSecondPosition.distanceTo(this.position);

				var velocity = new THREE.Vector3();
				velocity.subVectors(nextSecondPosition, this.position);
				return velocity;
			},

			calculatePosition : function(timeEpoch) {
				//position is set in KM, we need it in m;
				if (!this.orbit) return new THREE.Vector3(this.dist * 1000, 0, 0);

				/*
				a 	Semi-major axis
			    e 	Eccentricity
			    i 	Inclination
			    N 	Longitude of Ascending Node (Omega)
			    w 	Argument of periapsis
				
			    T 	Time at perihelion
			    M	Mean anomaly
			    l 	Mean Longitude
			    lp	longitude of periapsis
			    r	distance du centre
			    v	true anomaly

			    TLElement
			    epoch year
			    epoch day

				i
				RA of the Asc Node
				e
				w
				M
				
				

			    */

				var T = (timeEpoch-2451545) / 36525 ;

				var computed = {};
				for(var el in this.orbit.a) {
					computed[el] = this.orbit.a[el] + (this.orbit.cy[el] * T);
				}

				/*
				var b = -0.00041348;
				var c = 0.68346318;
				var s = -0.10162547;
				var f = 7.67025;/**/

				computed.w = computed.lp - computed.N;
				//computed.M = computed.L - computed.lp + (b * (T*T)) + (c * DegMath.cos(f * T)) + (s * DegMath.sin(f * T));
				computed.M = computed.l - computed.lp;
				computed.M = ((computed.M + 360) % 360 ) - 180;
				computed.E = computed.M + (180/Math.PI) * computed.e * DegMath.sin(computed.M) * (1 + computed.e * DegMath.cos(computed.M));

				var xPlane = computed.a * (DegMath.cos(computed.E) - computed.e);
				var yPlane = computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * DegMath.sin(computed.E);/**/

				computed.r = Math.sqrt(xPlane*xPlane + yPlane*yPlane)
    			computed.v = Math.atan2(yPlane, xPlane) * radToDeg;

    			var xeclip = computed.r * ( DegMath.cos(computed.N) * DegMath.cos(computed.v+computed.w) - DegMath.sin(computed.N) * DegMath.sin(computed.v+computed.w) * DegMath.cos(computed.i) )
			    var yeclip = computed.r * ( DegMath.sin(computed.N) * DegMath.cos(computed.v+computed.w) + DegMath.cos(computed.N) * DegMath.sin(computed.v+computed.w) * DegMath.cos(computed.i) )
			    var zeclip = computed.r * DegMath.sin(computed.v+computed.w) * DegMath.sin(computed.i)

				//console.dir(computed);
				//console.log(this.name, xPlane, yPlane)/**/
				var pos = new THREE.Vector3(xeclip * ns.AU * 1000, yeclip * ns.AU * 1000, zeclip * ns.AU * 1000);

				//console.log(pos.length() / (ns.AU * 1000), computed.r);

				return pos;//position is set in KM, we need it in m
				
			}
		};
	}
);