
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


				els[0] = this.calculateElements(timeEpoch+1);
				els[1] = this.calculateElements(timeEpoch-1);

				var orbitalVelocityFromDelta = new THREE.Vector3().subVectors(els[0].pos, els[1].pos);

				var deltaT = 1/Math.round(els[0].t - els[1].t);
				orbitalVelocityFromDelta.multiplyScalar(deltaT);

				var velocityElsFromDelta = $.extend({}, els[0], {pos:orbitalVelocityFromDelta});
    			var eclipticVelocityFromDelta = this.getPositionFromElements(velocityElsFromDelta);
				
				


				//vis viva to calculate speed (not velocity, i.e not a vector)
				var el = this.calculateElements(timeEpoch);
				var speed = Math.sqrt(ns.G * ns.U.centralBody.mass * ((2 / (el.r)) - (1 / (el.a))));

				//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
				var k = el.r / el.a;
				var alpha = Math.acos(((2 - (2 * el.e * el.e)) / (k * (2-k)))-1);

				//Vector3d vel = Quaternion.AngleAxis(alpha + ((PI - alpha) / 2.0), h) * -pos.normalized * velMag; // h is my orbit plane normal vector
				//var q = new THREE.Quaternion();
				//q.setFromAxisAngle();
				alpha = el.v < 0 ? (2*Math.PI) - alpha  : alpha;

				var velocityAngle = el.v + ((Math.PI - alpha) /  2);
				velocityAngle = el.v < 0 ? Math.PI + velocityAngle  : velocityAngle;
				//velocity vector in the plane of the orbit
				var orbitalVelocity = new THREE.Vector3(Math.cos(velocityAngle), Math.sin(velocityAngle)).setLength(speed);
				//orbitalVelocity.setLength(speed);
				var velocityEls = $.extend({}, el, {pos:orbitalVelocity});
    			var eclipticVelocity = this.getPositionFromElements(velocityEls);


    			var xvect = new THREE.Vector3(1, 0, 0);
    			var fromDeltaDiff = orbitalVelocityFromDelta.angleTo(xvect);
    			var fromVisVivaDiff = orbitalVelocity.angleTo(xvect);


    			/*var angleDiff = orbitalVelocityFromDelta.angleTo(orbitalVelocity);
    			if(this.name == 'halley') {

	    			var ratio = orbitalVelocityFromDelta.length() / orbitalVelocity.length();
	    			this.tracer.drawVector(eclipticVelocityFromDelta.clone().setLength(40), null, '#88dd88');
	    			this.tracer.drawVector(eclipticVelocity.clone().setLength(40 / ratio), null, '#dd8888');
    				var col = angleDiff > 0.01 ? '#ffaaaa' : '#aaffff';
    				var v = el.v;
    				var ha = ((Math.PI - alpha) /  2);
    				v *= radToDeg;
    				ha *= radToDeg;
    				ha = Math.round(ha);
    				v = Math.round(v);
    				var a = Math.round(alpha*radToDeg);

    				var correctAngle = orbitalVelocityFromDelta.angleTo(new THREE.Vector3(10,0,0));

    				var h = 'ν: '+ v +', α: '+a + '|'+ ha + ', va: '+Math.round(velocityAngle*radToDeg)+' dt:'+Math.round(correctAngle*radToDeg);
    				h = el.r;
    				var d = $('<div style="color:'+col+'">').html(h);
    				this.logger.append(d);
	    			var x = new THREE.Vector3(100, 0, 0);
	    			var q = new THREE.Quaternion();
	    			q.setFromEuler(new THREE.Vector3(0, 0, velocityAngle), 'XYZ');
	    			x.applyQuaternion(q);
	    			var xEls = $.extend({}, el, {pos:x});
    				var eclipticX = this.getPositionFromElements(xEls);
    				this.tracer.drawVector(eclipticX, null, '#ffffff');
    				//this.tracer.drawVector(eclipticX, {x:0, y:0}, '#ffffff');

	    		}/**/

				//return eclipticVelocityFromDelta;
				//return eclipticVelocityFromDelta.setLength(speed);
				return eclipticVelocity;
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
					computed = $.extend({}, this.orbit);
				}

				if (undefined === computed.w) {
					computed.w = computed.lp - computed.o;
				}

				if (undefined === computed.M) {
					computed.M = computed.l - computed.lp;
				}

				computed.a = computed.a * 1000;//was in km, set it in m

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

				computed.i = degToRad * computed.i;
				computed.o = degToRad * computed.o;
				computed.w = degToRad * computed.w;
				computed.M = degToRad * computed.M;
				computed.E = degToRad * computed.E;

				//in the plane of the orbit
				computed.pos = new THREE.Vector3(computed.a * (Math.cos(computed.E) - computed.e), computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * Math.sin(computed.E));

				computed.r = computed.pos.length();
    			computed.v = Math.atan2(computed.pos.y, computed.pos.x);

				this.calculatePeriod(computed);

				return computed;
			},

			getPositionFromElements : function(computed) {

				computed.r = computed.pos.length();
    			computed.v = Math.atan2(computed.pos.y, computed.pos.x);

    			var x = computed.r * ( Math.cos(computed.o) * Math.cos(computed.v+computed.w) -
    			Math.sin(computed.o) * Math.sin(computed.v+computed.w) * Math.cos(computed.i) )
			    var y = computed.r * ( Math.sin(computed.o) * Math.cos(computed.v+computed.w) +
			     Math.cos(computed.o) * Math.sin(computed.v+computed.w) * Math.cos(computed.i) )
			    var z = computed.r * Math.sin(computed.v+computed.w) * Math.sin(computed.i);/**/


				//invert y axis for 2d canvas (0 is top left, not bottom left as in cartesian systems)
				var pos = new THREE.Vector3(x, -y, z);
				
				return pos;
			},

			debug : function(){
				return;
				this.planet.graphics.clear();
				
				if(this.name != 'earth') return;

				this.tracer.drawAxis();

				var computed = {};

				computed.pos = new THREE.Vector3(0, 100);

				computed.r = computed.pos.length();
    			computed.v = Deg.atan2(computed.pos.y, computed.pos.x);

				computed.o = 88;
				computed.w = 0;//
				computed.i = 45;

    			var x = computed.r * ( Deg.cos(computed.o) * Deg.cos(computed.v+computed.w) -
    			Deg.sin(computed.o) * Deg.sin(computed.v+computed.w) * Deg.cos(computed.i) )
			    var y = computed.r * ( Deg.sin(computed.o) * Deg.cos(computed.v+computed.w) +
			     Deg.cos(computed.o) * Deg.sin(computed.v+computed.w) * Deg.cos(computed.i) )
			    var z = computed.r * Deg.sin(computed.v+computed.w) * Deg.sin(computed.i);/**/
			    var pos = new THREE.Vector3(x, -y, z);
				
				this.tracer.spotPos(pos.x, pos.y, '#00ff22', 2);
				this.tracer.spotPos(pos.x, -pos.z, '#00aa00');
 				
 				var q0 = new THREE.Quaternion();
 				var q1 = new THREE.Quaternion();
 				computed.o *= degToRad * 1;
 				computed.w *= degToRad * 1;
 				computed.i *= degToRad * 1;/**/

 				//Vector3d vel = Quaternion.AngleAxis(alpha + ((PI - alpha) / 2.0), h) * -pos.normalized * velMag; // h is my orbit plane normal vector

 				/*computed.i = (computed.i) * degToRad * 1;
 				computed.o = (computed.o) * degToRad * 1;
 				computed.w = (computed.w - 90) * degToRad * 1;/**/

 				//computed.w =  -0.5 * Math.PI - computed.w;
 				//computed.o -= Math.PI/2;
 				//q.setFromEuler(new THREE.Vector3((computed.o*degToRad)-(Math.PI/2), (computed.i*degToRad)+(Math.PI/2), computed.w*degToRad), 'ZYX').inverse();
 				q0.setFromEuler(new THREE.Vector3(0, computed.i, computed.o), 'ZYX');
 				q1.setFromEuler(new THREE.Vector3(0, 0, computed.w), 'XYZ');
 				var qpos = computed.pos.clone();
 				qpos.applyQuaternion(q0);
 				//qpos.applyQuaternion(q1);
 				qpos.y = -qpos.y;

				this.tracer.spotPos(qpos.x, qpos.y, '#ff2200', 2);
				this.tracer.spotPos(qpos.x, -qpos.z, '#aa0000');

				console.log(this.name, computed.r, computed.w);
				console.log('classic');
				console.log(pos.x, pos.y, pos.z);
				console.log('quaternion');
				console.log(qpos.x, qpos.y, qpos.z);
				console.log('lengths');
				console.log(pos.length(), qpos.length());
				//throw new Error('fuck yall');
			},

			calculatePeriod : function(elements) {
				if(this.period || !ns.U.centralBody || !ns.U.centralBody.k) return;

				this.period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a/(ns.AU*1000), 3)) / ns.U.centralBody.k;
			}
		};
	}
);

