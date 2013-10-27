/**
	source for calculations http://www.braeunig.us/apollo/apollo11-TLI.htm
*/

define([
	'jsorrery/NameSpace',
	'jsorrery/scenario/CommonCelestialBodies',
	'_'
], function(ns, common){
	'use strict';

	var launchTimes = [
		'1968-10-11:15:02:45.000Z',
		'1968-12-21T12:51:00.000Z',
		'1969-03-03:16:00:00.000Z',
		'1969-05-18T16:49:00.000Z',
		'1969-07-16T13:32:00.000Z',
		'1969-11-14T16:22:00.000Z',
		'1970-04-11T19:13:00.000Z',
		'1971-01-31T21:03:02.000Z',
		'1971-07-26T13:34:00.000Z',
		'1972-04-16T17:54:00.000Z',
		'1972-12-07T05:33:00.000Z'
	];

	var OrbitData = {
		earth : {
			name : [
				'Apollo7',
				'Apollo8',
				'Apollo9',
				'Apollo10',
				'Apollo11',
				'Apollo12',
				'Apollo13',
				'Apollo14',
				'Apollo15',
				'Apollo16',
				'Apollo17'
			],
			time : [//Insertion - GET (sec)
				626.76,
				694.98,
				674.66,
				713.76,
				709.33,
				703.91,
				759.83,
				710.56,
				704.67,
				716.21,
				712.65
			],
			altitude : [//Altitude (ft)
				748439,
				627819,
				626777,
				627869,
				626909,
				626360,
				628710,
				626364,
				566387,
				567371,
				559348
			],
			surfRange : [//Surface Range (n mi)
				1121.743,
				1430.363,
				1335.515,
				1469.790,
				1460.697,
				1438.608,
				1572.300,
				1444.989,
				1445.652,
				1469.052,
				1456.314
			],
			earthVel : [//Earth Fixed Velocity (ft/sec)
				24208.5,
				24242.9,
				24246.39,
				24244.3,
				24243.9,
				24242.3,
				24242.1,
				24221.6,
				24242.4,
				24286.1,
				24230.9
			],
			spaceVel : [//Space-Fixed Velocity (ft/sec)
				25553.2,
				25567.06,
				25569.78,
				25567.88,
				25567.9,
				25565.9,
				25566.1,
				25565.8,
				25602.6,
				25605.0,
				25603.9
			],
			geoLat : [//Geocentric Latitude (deg N)
				31.4091,
				32.4741,
				32.4599,
				32.5303,
				32.5027,
				31.5128,
				32.5249,
				31.0806,
				29.2052,
				32.5262,
				24.5384
			],
			geodLat : [//Geodetic Latitude (deg N)
				31.58,
				32.6487,
				32.629,
				32.700,
				32.672,
				32.6823,
				32.6945,
				31.2460,
				29.3650,
				32.6963,
				24.6805
			],
			long : [//Longitude (deg E)
				-61.2293,
				-53.2923,
				-55.1658,
				-52.5260,
				-52.6941,
				-53.1311,
				-50.4902,
				-52.9826,
				-53.0807,
				-52.5300,
				-53.8107
				],
			pathAngle : [//Space-Fixed Flight Path Angle (deg)
				0.005,
				0.0006,
				-0.0058,
				-0.0049,
				0.012,
				-0.014,
				0.005,
				-0.003,
				0.015,
				0.001,
				0.003
			],
			headingAngle : [//Space-Fixed Heading Angle (deg E of N)
				86.32,
				88.532,
				87.412,
				89.933,
				88.848,
				88.580,
				90.148,
				91.656,
				95.531,
				88.932,
				105.021
			],
			apo : [//Apogee (n mi)
				152.34,
				99.99,
				100.74,
				100.32,
				100.4,
				100.1,
				100.3,
				100.1,
				91.5,
				91.3,
				90.3
			],
			peri : [//Perigee (n mi)
				123.03,
				99.57,
				99.68,
				99.71,
				98.9,
				97.8,
				99.3,
				98.9,
				89.6,
				90.0,
				90.0
			],
			period : [//Period (mins)
				89.55,
				88.19,
				88.20,
				88.20,
				88.18,
				88.16,
				88.19,
				88.18,
				87.84,
				87.85,
				87.83
			],
			incl : [//Inclination (deg)
				31.608,
				32.509,
				32.552,
				32.546,
				32.521,
				32.540,
				32.547,
				31.120,
				29.679,
				32.542,
				28.526
			],
			descNode : [//Descending Node (deg) 
				42.415,
				45.538,
				123.132,
				123.088,
				123.126,
				123.084,
				117.455,
				109.314,
				123.123,
				86.978
			],
			ecc : [//Eccentricity
				0.0045,
				0.00006,
				0.000149,
				0.000086,
				0.00021,
				0.00032,
				0.0001,
				0.0002,
				0.0003,
				0.0002,
				0.0000
			]
		},
		TLI : {
			name : [ 
				'Apollo8',
				'Apollo10',
				'Apollo11',
				'Apollo12',
				'Apollo13',
				'Apollo14',
				'Apollo15',
				'Apollo16',
				'Apollo17'
			],
			time : [//GET
				'002:56:05.51',
				'002:39:20.58',
				'002:50:13.03',
				'002:53:13.94',
				'002:41:47.15',
				'002:34:33.24',
				'002:56:03.61',
				'002:39:28.42',
				'003:18:37.64'
			],
			gmt:[//GMT Time
				'1968-12-21T15:47:05.000Z',
				'1969-05-18T19:28:20.000Z',
				'1969-07-16T16:22:13.000Z',
				'1969-11-14T19:15:13.000Z',
				'1970-04-11T21:54:47.000Z',
				'1971-01-31T23:37:35.000Z',
				'1971-07-26T16:30:03.000Z',
				'1972-04-16T20:33:28.000Z',
				'1972-12-07T08:51:37.000Z'
			],
			altitude : [//Altitude (ft)
				1137577,
				1093217,
				1097229,
				1209284,
				1108555,
				1090930,
				1055296,
				1040493,
				1029299
			],

			earthVel : [//Earth Fixed Velocity (ft/sec)
				34140.1,
				34217.2,
				34195.6,
				34020.5,
				34195.3,
				34151.5,
				34202.2,
				34236.6,
				34168.3
			],
			spaceVel : [//Space-Fixed Velocity (ft/sec)
				35505.41,
				35562.96,
				35545.6,
				35389.8,
				35538.4,
				35511.6,
				35579.1,
				35566.1,
				35555.3
			],
			geoLat : [//Geocentric Latitude (deg N)
				21.3460,
				-13.5435,
				9.9204,
				16.0791,
				-3.8635,
				-19.4388,
				24.8341,
				-11.9117,
				4.6824
			],
			geodLat : [//Geodetic Latitude (deg N)
				21.477,
				-13.627,
				9.983,
				16.176,
				-3.8602,
				-19.554,
				24.9700,
				-11.9881,
				4.7100
			],
			long : [//Longitude (deg E)
				-143.9242,
				159.9201,
				-164.8373,
				-154.2798,
				167.2074,
				141.7312,
				-142.1295,
				162.4820,
				-53.1190
			],
			pathAngle : [//Flight Path Angle (deg)[2]
				7.897,
				7.379,
				7.367,
				8.584,
				7.635,
				7.480,
				7.430,
				7.461,
				7.379
			],
			headingAngle : [//Heading Angle (deg E of N)
				67.494,
				61.065,
				60.073,
				63.902,
				59.318,
				65.583,
				73.173,
				59.524,
				118.110
			],
			incl : [//Inclination (deg)
				30.636,
				31.698,
				31.383,
				30.555,
				31.817,
				30.834,
				29.696,
				32.511,
				28.466
			],
			descNode : [//Descending Node (deg)
				38.983,
				123.515,
				121.847,
				120.388,
				122.997,
				117.394,
				108.439,
				122.463,
				86.042
			],
			ecc : [//Eccentricity
				0.97553,
				0.97834,
				0.97696,
				0.96966,
				0.9772,
				0.9722,
				0.9760,
				0.9741,
				0.9722
			],
			c3 : [//C3 (ft2/sec2)
				-15918930,
				-14084265,
				-14979133,
				-19745586,
				-14814090,
				-18096135,
				-15643934,
				-16881439,
				-18152226
			]
		}
	};

	//source : http://www.csgnetwork.com/siderealjuliantimecalc.html
	var getLongAtLocalSideralTime = function(dateGMT, longitude){
		var day = dateGMT.getUTCDate();
		var month = dateGMT.getUTCMonth() + 1;
		var year = dateGMT.getUTCFullYear();
		var hour = dateGMT.getUTCHours();
		var minute = dateGMT.getUTCMinutes();
		var second = dateGMT.getUTCSeconds();

		//		Julian Day 
		if (month<3) {
			year = year - 1;
			month = month + 12;
		}

		var GR = 0;
		if (year + month / 100 + day / 10000 >= 1582.1015)  {
			GR = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4);
		}

		var JD = Math.floor(365.25 * year) + Math.floor(30.6001 * (month + 1)) + day + 1720994.5 + GR ;
			
	//		time sidereal 0h
		var T = (JD - 2415020) / 36525;
		var SS = 6.6460656 + 2400.051 * T + 0.00002581 * T * T;
		var ST =( SS / 24 - Math.floor(SS / 24)) * 24;

	//		time sidereal local
		var dayTime = (hour + (minute / 60) + (second / 3600))/24;
		var SA = ST + dayTime * 24 * 1.002737908;
		SA = SA + longitude/15;
		SA = (SA + 24) % 24;

		var TSH = Math.floor(SA);
		var TSM = Math.floor((SA - Math.floor(SA)) * 60);
		var TSS = ((SA - Math.floor(SA)) * 60 - TSM) * 60;
		
		return ((TSH / 24) + (TSM/(24*60)) + (TSS/(24*60*60))) * 360;
	};


	var GM = 3.986005e14;
	return {
		get : function(orbitType, missionName){
			
			//see http://www.braeunig.us/apollo/apollo11-TLI.htm

			var numbers = OrbitData[orbitType];
			var idx = numbers.name.indexOf(missionName);
			if(idx === -1) return;

			var v = numbers.spaceVel[idx] * ns.FT_TO_M;
			var r = (numbers.altitude[idx] * ns.FT_TO_M) + (common.earth.radius * ns.KM);
			var C = (2 * GM) / (r * Math.pow(v, 2));

			var pathAngle = ns.DEG_TO_RAD * numbers.pathAngle[idx];
			var cosPathSq = Math.pow(Math.cos(pathAngle), 2);
			var sinPathSq = Math.pow(Math.sin(pathAngle), 2);
			var CSquared = Math.pow(C, 2);
			var arg1 = Math.sqrt(CSquared - 4 * (1 - C) * - cosPathSq);
			var arg2 = (2 * (1 - C));
			//radius perigee
			var rp = ((-C + arg1) / arg2) * r;
			//radius apogee
			var ra = ((-C - arg1) / arg2) * r;
			//eccentricity
			var e = Math.sqrt( Math.pow((((r * Math.pow(v, 2)) / GM) - 1), 2) * cosPathSq + sinPathSq);
			//semimajor axis
			var a = ( r + ra ) / 2;

			var rvgm = r * Math.pow(v,2) / GM ;
			//true anomaly
			var trueAnomaly = Math.atan((rvgm * Math.cos(pathAngle) * Math.sin(pathAngle)) / (rvgm * cosPathSq - 1));/**/
			
			var ln = Math.asin( Math.sin(ns.DEG_TO_RAD * numbers.geoLat[idx]) / Math.sin(ns.DEG_TO_RAD * numbers.incl[idx]) );
			var as = Math.atan( Math.tan(ln) * Math.cos(ns.DEG_TO_RAD * numbers.incl[idx]) );

			var argumentPerigee = ln - trueAnomaly;

			var geoLongAscNode = ((ns.DEG_TO_RAD * numbers.long[idx]) - as) + ns.CIRCLE;


			var epoch;
			if(numbers.gmt){
				epoch = new Date(numbers.gmt[idx]);
			} else {
				epoch = new Date(new Date(launchTimes[idx]).getTime() + numbers.time[idx]*1000);
			}
			var celestLongAscNode = getLongAtLocalSideralTime(epoch, geoLongAscNode * ns.RAD_TO_DEG);

			var E = Math.acos( ( e + Math.cos(trueAnomaly) ) / (1 + e * Math.cos(trueAnomaly)));
			var M = E - e * Math.sin(E);
			var N = Math.sqrt(GM / Math.pow(a, 3));
			var T = M / N;
			
			/*
			console.log('**************************************** '+orbitType);
			console.log('r',r);
			console.log('v',v);
			console.log('C',C);
			console.log('perigee',rp);
			console.log('apogee',ra);
			console.log('eccentricity',e);
			console.log('trueAnomaly', trueAnomaly * ns.RAD_TO_DEG);
			console.log('argumentPerigee', argumentPerigee * ns.RAD_TO_DEG);
			console.log('semi-major axis',a);
			console.log('ln',ln * ns.RAD_TO_DEG);
			console.log('as',as * ns.RAD_TO_DEG);
			console.log('geoLongAscNode', geoLongAscNode * ns.RAD_TO_DEG);
			console.log('celestLongAscNode', celestLongAscNode);
			console.log('E', E);
			console.log('M', M);
			console.log('N', N);
			console.log('T', T);
			/**/

			/*if(orbitType=='earth'){
				celestLongAscNode += 145;
				celestLongAscNode = celestLongAscNode%360;
			}/**/

			return {
				epoch : epoch,
				orbit : {
					relativeTo : 'earth',
					base : {
						a : a / ns.KM,
						e : e,
						w : (argumentPerigee * ns.RAD_TO_DEG), 
						M : M * ns.RAD_TO_DEG ,
						i : numbers.incl[idx],
						o : celestLongAscNode
					},
					day : {
						a : 0,
						e : 0,
						i : 0,
						M : N * ns.RAD_TO_DEG * ns.DAY,
						w : 0,
						o : 0
					}	
				}
			};

		}
	};

});