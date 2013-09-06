define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/data/Constellations'
	], 
	function(ns, $, Constellations){
		'use strict';

		var rendered;

		//keys of the loaded array
		var NAME = 0;
		var X = 1;
		var Y = 2;
		var Z = 3;
		var SPECT = 4;
		var MAG = 5;

		var namedStars = {};

		var drawConstellations = function(){

			var material = new THREE.LineBasicMaterial({
		        color: 0x666666
		    });

			$.each(Constellations, function(fromName, toArr){
				var fromPoint = namedStars[fromName];

				$.each(toArr, function(i, toName){
					var toPoint = namedStars[toName];
					
					var orbitGeom = new THREE.Geometry();
				    orbitGeom.vertices = [fromPoint, toPoint];
				    var line = new THREE.Line(orbitGeom, material);
				    rendered.add(line);
				});
			});
		};

		var MilkyWay = {
			dataSrc : 'js/orbit/data/milkyway.json',
			init : function(size){

				var particles = new THREE.Geometry();
				var pMaterial = new THREE.ParticleBasicMaterial({
					color: 0xFFFFFFF,
					size: 20,
					map: THREE.ImageUtils.loadTexture(
						'img/star.png'
					),
					blending: THREE.AdditiveBlending,
					transparent: true
				});


				// create the particle system
				rendered = this.displayObj = new THREE.Object3D();
				var particleSystem = new THREE.ParticleSystem(particles, pMaterial);
				rendered.rotation.x = -((23+(26/60)+(21/3600)) * ns.DEG_TO_RAD);

				var ajaxPromise = $.ajax({
					url : this.dataSrc,
					dataType : 'json'
				});
				

				ajaxPromise.then(function(res){

					var nStars = res.length;
					var pos;
					var name;
					for(var s = 0; s < nStars; s++) {
						name = res[s][NAME];
						pos = new THREE.Vector3(res[s][X], res[s][Y], res[s][Z]);
						pos.normalize().multiplyScalar(size);
						particles.vertices.push(pos);
						if(name) namedStars[name] = pos;
					}

					rendered.add(particleSystem);

					drawConstellations();

				});
				ajaxPromise.fail(function(jqXHR, textStatus, errorThrown){
					console.log(textStatus);
				});

			},

			getDisplayObject : function(){
				return this.displayObj;
			},

			setPosition : function(pos){
				this.displayObj && this.displayObj.position.copy(pos);
			}
		};

		return MilkyWay;
	}
);