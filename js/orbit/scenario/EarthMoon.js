

define(
	[
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies'
	], 
	function(ns, common) {

		
		var system =  {
			name : 'EarthMoon',
			commonBodies : ['earth', 'moon'],
			bodies : {
				moon : {
					afterInitialized : function() {
						var earth = ns.U.getBody('earth');
						if(earth) {
							var eclPos = this.position.clone().normalize();
							eclPos.z = 0;
							var angleX = eclPos.angleTo(new THREE.Vector3(1, 0, 0));
							var angleY = eclPos.angleTo(new THREE.Vector3(0, 1, 0));
							//console.log(angleX, angleY);
							var angle = angleX;
							var q = Math.PI / 2;
							if(angleY > q) angle = -angleX; 
							this.originalMapRotation = angle + Math.PI;
						}
					}
				}
			},
			secondsPerTick : 3600,
			calculationsPerTick : 1000,
			calculateAll : false,
			fov: 3
		};


		return system;
		
	}
);