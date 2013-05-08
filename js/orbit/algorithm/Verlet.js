define(
	[
		'orbit/NameSpace',
		'jquery',
		'three'
	],
	function(ns, $) {
	

		var Verlet = {
			moveBody : function(deltaTIncrement, isLast){
				
				if(this.previousPosition){
					var beginPos = this.position.clone();
					
					this.force.multiplyScalar( 1 / this.mass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.force.multiplyScalar(deltaTIncrement * deltaTIncrement);
					
					var workVect = this.position.clone().sub(this.previousPosition);
					this.position.add(workVect);
					this.position.add(this.force);
					this.previousPosition = beginPos;
					
					
				} else {//initialisation (with Euler algorithm)
					this.previousPosition = this.position.clone();
					
					this.force.multiplyScalar( 1 / this.mass);//force is in newtons, need to divide it by the mass to get number of m/s*s of accel
					this.force.multiplyScalar(deltaTIncrement);
					this.velocity.add(this.force);
					
					var correctedVel = this.velocity.clone();
					correctedVel.multiplyScalar(deltaTIncrement);//speed needs to take deltaT into account
					this.position.add(correctedVel);
				}

				this.force = new THREE.Vector3(0, 0, 0);//reset force
			}
		};

		return Verlet;
		
		//trace le vecteur de force avant le scale de delta t
						/*vecteur.graphics.clear();
						vecteur.graphics.lineStyle(0.5, 0x555555);
						vecteur.graphics.moveTo(0,0);
						vecteur.graphics.lineTo(_force.x*1000, _force.y*1000);/**/
						
						//force value is applied each second, and we consider that it is the same for each second of deltaT. Result is thus an approximation of what would happen in real life.
						
						//test
						/*var tVel:Vector3D=_velocity.clone();
						var tPos:Vector3D=_position.clone();
						var i:int=0;
						var ttr:Sprite=new Sprite();
						ttr.graphics.lineStyle(0.5, 0xffffff);
						ttr.graphics.moveTo(tPos.x/Univers.nmPerPix, tPos.y/Univers.nmPerPix);/**/
						/*while(i<deltaT){
							tVel=tVel.add(_force);
							tPos=tPos.add(tVel);
						//	ttr.graphics.lineTo(tPos.x/Univers.nmPerPix, tPos.y/Univers.nmPerPix);
							i++;
						}/**/
						//if(parent) parent.addChild(ttr);
						
						//number of times force is added during this delta t
						//_force.multiplyScalar((deltaT*(deltaT+1))/2);
	

	}
);
