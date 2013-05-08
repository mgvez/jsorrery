/** 


*/

define(
	[
		'orbit/NameSpace'
	], 
	function(ns, $) {

		
		return {
			bodies : {
				sun : {
					mass : 1.9891e30,
					dist : 0,
					speed : 0,
					traceColor : '#ffff00',
					traceFrom : 0
				},
				mercury : {
					mass : 3.3022e23,
					dist : 0.38709 * ns.AU,
					speed : 47.87,
					traceColor : '#cc9900',
					traceFrom : 0
				},
				venus : {
					mass : 4.868e24,
					dist : 0.723332 * ns.AU,
					speed : 35.02,
					traceColor : '#00cc99',
					traceFrom : 0
				},
				earth : {
					mass : 5.9736e24,
					dist : 1 * ns.AU,
					speed : 29.78,
					traceColor : '#1F7CDA',
					traceFrom : 0
				},
				mars : {
					mass : 6.4185e23,
					dist : 1.523679 * ns.AU,
					speed : 24.077,
					traceColor : '#ff3300',
					traceFrom : 0
				},
				jupiter : {
					mass : 1.8986e27,
					dist : 4.95 * ns.AU,
					speed : 13.72,
					traceColor : '#ff9932',
					traceFrom : 0
				},
				saturn : {
					mass : 5.6846e26,
					dist : 9.582017 * ns.AU,
					speed : 9.69,
					traceColor : '#ffcc99',
					traceFrom : 0
				},
				uranus : {
					mass : 8.6810e25,
					dist : 19.229411 * ns.AU,
					speed : 6.81,
					traceColor : '#99ccff',
					traceFrom : 0
				},
				neptune : {
					mass : 1.0243e26,
					dist : 30.10366151 * ns.AU,
					speed : 5.43,
					traceColor : '#3299ff',
					traceFrom : 0
				},
				plutoCharon : {
					mass : 1.305e22+1.52e21,
					dist : 29.658 * ns.AU,
					speed : 6.112,
					traceColor : '#aaaaaa',
					traceFrom : 0
				}/**/
			},
			
			secondsPerTick : 3600*24*5,
			largestRadius : 5,
			smallestRadius : 2,

		};
		
	}
);