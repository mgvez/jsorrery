/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'orbit/NameSpace',
		'jquery'
	], 
	function(ns, $) {

		
		var cnf = {
			bodies : {
				sun : {
					mass : 1.9891e30,
					radius : 6.96342e5,
					dist : 0,
					speed : 0,
					color : '#ffff00',
					traceFrom : 0,
					k : 0.01720209895 //gravitational constant (μ)
				},
				mercury : {
					mass : 3.3022e23,
					radius:2439,
					dist : 0.38709 * ns.AU,
					speed : 47.87,
					color : '#cc9900',
					traceFrom : 0
				},
				venus : {
					mass : 4.868e24,
					radius : 6051,
					dist : 0.723332 * ns.AU,
					speed : 35.02,
					color : '#00cc99',
					traceFrom : 0
				},
				earth : {
					mass : 5.9736e24,
					radius : 6378.1,
					dist : 1 * ns.AU,
					speed : 29.78,
					color : '#1F7CDA',
					traceFrom : 0,
					isLog : true
				},
				mars : {
					mass : 6.4185e23,
					radius : 3376,
					dist : 1.523679 * ns.AU,
					speed : 24.077,
					color : '#ff3300',
					traceFrom : 0
				},
				
				jupiter : {
					mass : 1.8986e27,
					radius : 71492,
					dist : 4.95 * ns.AU,
					speed : 13.72,
					color : '#ff9932',
					traceFrom : 0
				},
				saturn : {
					mass : 5.6846e26,
					radius : 60268,
					dist : 9.582017 * ns.AU,
					speed : 9.69,
					color : '#ffcc99',
					traceFrom : 0
				},
				uranus : {
					mass : 8.6810e25,
					radius : 25559,
					dist : 19.229411 * ns.AU,
					speed : 6.81,
					color : '#99ccff',
					traceFrom : 0
				},
				neptune : {
					mass : 1.0243e26,
					radius : 24764,
					dist : 30.10366151 * ns.AU,
					speed : 5.43,
					color : '#3299ff',
					traceFrom : 0
				},
				pluto : {
					mass : 1.305e22+1.52e21,
					radius : 1153,
					dist : 29.658 * ns.AU,
					speed : 6.112,
					color : '#aaaaaa',
					traceFrom : 0
				},/**/
				halley : {
					mass : 2.2e14,
					radius : 50,
					dist : 0.586 * ns.AU,
					speed : -54.584,
					color : '#dd8855',
					isLog : true
				}/**/
			},
			
			secondsPerTick : 3600*24 *7,
			calculationsPerTick : 1000,
			largestRadius : 5,

		};


		var orbitalElements = {
			mercury : { 
				base : {a :  0.38709927 ,  e :  0.20563593, i:  7.00497902, l :    252.25032350, lp :  77.45779628, N :  48.33076593},
				cy : {a :  0.00000037 ,  e :  0.00001906, i: -0.00594749, l : 149472.67411175, lp :   0.16047689, N :  -0.12534081}
			},
			venus : {
				base : {a :  0.72333566 ,  e :  0.00677672, i:  3.39467605, l :    181.97909950, lp : 131.60246718, N :  76.67984255},
				cy : {a :  0.00000390 ,  e : -0.00004107, i: -0.00078890, l :  58517.81538729, lp :   0.00268329, N :  -0.27769418}
			},
			mars : {
				base : {a :  1.52371034 ,  e :  0.09339410, i:  1.84969142, l :     -4.55343205, lp : -23.94362959, N :  49.55953891},
				cy : {a :  0.00001847 ,  e :  0.00007882, i: -0.00813131, l :  19140.30268499, lp :   0.44441088, N :  -0.29257343}
			},
			earth : {
				base : {a : 1.00000261, e : 0.01671123, i : -0.00001531, l : 100.46457166, lp : 102.93768193, N : 0.0},
          		cy : {a : 0.00000562, e : -0.00004392, i : -0.01294668, l : 35999.37244981, lp : 0.32327364, N : 0.0}
			},
 			jupiter : {
				base : {a :  5.20288700 ,  e :  0.04838624, i:  1.30439695, l :     34.39644051, lp :  14.72847983, N : 100.47390909},
				cy : {a : -0.00011607 ,  e : -0.00013253, i: -0.00183714, l :   3034.74612775, lp :   0.21252668, N :   0.20469106}
			},
			saturn : {
				base : {a :  9.53667594 ,  e :  0.05386179, i:  2.48599187, l :     49.95424423, lp :  92.59887831, N : 113.66242448},
				cy : {a : -0.00125060 ,  e : -0.00050991, i:  0.00193609, l :   1222.49362201, lp :  -0.41897216, N :  -0.28867794}
			},
			uranus : {
				base : {a : 19.18916464 ,  e :  0.04725744, i:  0.77263783, l :    313.23810451, lp : 170.95427630, N :  74.01692503},
				cy : {a : -0.00196176 ,  e : -0.00004397, i: -0.00242939, l :    428.48202785, lp :   0.40805281, N :   0.04240589}
			},
			neptune : {
				base : {a : 30.06992276 ,  e :  0.00859048, i:  1.77004347, l :    -55.12002969, lp :  44.96476227, N : 131.78422574},
				cy : {a :  0.00026291 ,  e :  0.00005105, i:  0.00035372, l :    218.45945325, lp :  -0.32241464, N :  -0.00508664}
			},
			pluto : {
				base : {a : 39.48211675 ,  e :  0.24882730, i: 17.14001206, l :    238.92903833, lp : 224.06891629, N : 110.30393684},
				cy : {a : -0.00031596 ,  e :  0.00005170, i:  0.00004818, l :    145.20780515, lp :  -0.04062942, N :  -0.01183482}
			},
			halley : {
				base : {a : 17.83414429 ,  e :  0.967142908, i: 162.262691, M : 0, w : 111.332485, N : 58.420081},
				day : {a : 0 ,  e :  0, i:  0, M : (360 / (25 * 365.25) ), w : 0, N : 0}
				//day : {a : 0 ,  e :  0, i:  0, M : (360 / (76 * 365.25) ), w : 0, N : 0}
				/*base : {a : 1.5414429 ,  e :  0.967142908, i: 0, M : 0, w : 111.332485, N : 58.420081},
				day : {a : 0 ,  e :  0, i:  0, M : (360 / (5 * 365.25) ), w : 0, N : 0}/**/
			}
		};

/*
a = 17.83414429 AU
e = 0.967142908
i = 162.262691 degrees
Ω = 58.420081 degrees
ω = 111.332485 degrees
*/
		$.each(orbitalElements, function(planet, elements){
			if(cnf.bodies[planet]) cnf.bodies[planet].orbit = elements;
		});

		return cnf;
		
	}
);