/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {

		var baseNEO = {
			mass : 1,
			radius : 2000,
			color : '#ffffff'
		};

		var cnf = {
			name : 'NEO',
			title : 'Near Earth Objects',
			/*calculateAll : true,
			usePhysics : true,/**/
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				'moon',
				'mars'
			],
			bodies : {
				_2013XY20 : _.extend({
					title : '2013 XY8',
					orbit: {
						epoch : new Date('2013-11-04T00:00:00'),
						base : {
							a : 2.235306826006964 * ns.AU,
							e : 0.573857831623473,
							w : 24.30287877488278,
							M : 343.0917919285855,
							i : 1.781235616802272,
							o : 81.04754838999639
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : 360 / 1220.686505021548,
							w : 0,
							o : 0
						}	
					}
				}, baseNEO),
				_2009RR : _.extend({
					title : '2009 RR',
					orbit: {
						epoch : new Date('2013-11-04T00:00:00'),
						base : {
							a : 1.405605721694525 * ns.AU,
							e : 0.4654947695576891,
							w : 256.7957983490506,
							M : 141.9424462052399,
							i : 6.089886990370658,
							o : 174.2548411481731
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : 360 / 608.6865444259238,
							w : 0,
							o : 0
						}	
					}
				}, baseNEO),
				/*_872Holda : _.extend({
					title : '872 Holda',
					orbit: {
						epoch : new Date('2013-11-04T00:00:00'),
						base : {
							a : 2.730657032711904 * ns.AU,
							e : 0.08026874050863506	,
							w : 18.3897992393082,
							M : 148.9717777681654,
							i : 7.369124707264008,
							o : 194.798325258132
						},
						day : {
							a : 0,
							e : 0,
							i : 0,
							M : 360 / 1648.159210943693,
							w : 0,
							o : 0
						}	
					}
				}, baseNEO)/**/
			},
			secondsPerTick : 3600,
			calculateAll : false,
			defaultGuiSettings : { 
				planetScale : 10
			},
			help : "This scenario shows selected objects from Nasa's Near Earth Object Project (<a href=\"http://neo.jpl.nasa.gov/\" target=\"_blank\">http://neo.jpl.nasa.gov/</a>."
		};

		return cnf;
		
	}
);