define(
	[
		'orbit/NameSpace',
		'jquery',
		'orbit/data/Constellations',
		'orbit/graphics3d/shaders/ShaderLoader',
		'_'
	], 
	function(ns, $, Constellations, ShaderLoader){
		'use strict';

		var rendered;

		var pxRatio = (window.devicePixelRatio || 1);

		//keys of the loaded array
		var NAME = 0;
		var X = 1;
		var Y = 2;
		var Z = 3;
		var MAG = 4;
		var SPECT = 5;
		var MIN_MAG = -1.44;

		var spectralColors = {
			O : 0x9db4ff,
			B : 0xaabfff,
			A : 0xcad8ff,
			F : 0xfbf8ff,
			G : 0xfff4e8,
			K : 0xffddb4,
			M : 0xffbd6f,
			L : 0xf84235,
			T : 0xba3059,
			Y : 0x605170
		};

		var namedStars = {};

		var lightenDarkenColor = function (hex, amount) {
			var col = [hex >> 16, (hex >> 8) & 0x00FF,  hex & 0x0000FF];
			col = _.map(col, function(part, i){
				part *= amount;
				return part < 0 ? 0 : (part > 255 ? 255 : part);
			});
			return (col[0] | (col[1] << 8) | (col[2] << 16));
		};


		var drawConstellations = function(){

			var material = new THREE.LineBasicMaterial({
		        color: pxRatio === 1 ? 0x111111 : 0x222222
		    });

			$.each(Constellations, function(fromName, toArr){
				var fromPoint = namedStars[fromName];

				$.each(toArr, function(i, toName){
					var toPoint = namedStars[toName];
					if(!toPoint || !fromPoint) return;
					
					var orbitGeom = new THREE.Geometry();
				    orbitGeom.vertices = [fromPoint, toPoint];
				    var line = new THREE.Line(orbitGeom, material);
				    rendered.add(line);
				});
			});
		};

		var getShaderAttr = function(){
			var starTexture = THREE.ImageUtils.loadTexture( "img/star.png" );
			var starColorGraph = THREE.ImageUtils.loadTexture( 'img/star_color_modified.png' );

			return {
				uniforms : {
					color:     { type: "c", value: new THREE.Color( 0xffffff ) },
					starTexture:   { type: "t", value: starTexture },
					spectralMap: {type: "t", value: starColorGraph },
					idealDepth: { type: "f", value: 1.0 },
					blurPower: { type: "f", value: 1.0 },
					blurDivisor: { type: "f", value: 2.0 },
					sceneSize: { type: "f", value: 120.0 },
					scale: { type: "f", value: 1.0 },
					brightnessScale: { type: "f", value: 1.0 },
				},

				attributes : {
					size: 			{ type: 'f', value: [] },
					customColor: 	{ type: 'c', value: [] },
					colorIndex: 	{ type: 'f', value: [] },
				}
			};
		};

		var generateStars = function(shaders, stars, size) {
			
			var shaderAttr = getShaderAttr();
			var container = new THREE.Object3D();

			var pGeo = new THREE.Geometry();
			var count = stars.length;

			var star;
			var starVect;
			var mag;
			var name;
			var spectralType;
			var starColor;

			for( var i=0; i<count; i++ ){
				star = stars[i];
				starVect = new THREE.Vector3(star[X], star[Y], star[Z]);
				if(starVect.x === 0) continue;//dont add the sun
				starVect.normalize().multiplyScalar(size);

				mag = starVect.mag = (star[MAG] - MIN_MAG) + 1;
				name = star[NAME];
				spectralType = String(star[SPECT]).toUpperCase();
				starColor  = spectralColors[spectralType] || spectralColors.F;

				
				if(starVect.mag < 7) {
					//starVect.size = 2 + Math.pow((2 / starVect.mag), 1.2);
					starColor = lightenDarkenColor(starColor, Math.pow(1/starVect.mag, (pxRatio*0.5)));
				} else {
					//starVect.size = 2;
					starColor = lightenDarkenColor(starColor, Math.pow(1/starVect.mag, (1.1/pxRatio)));
				}			
				/**/
				//starColor=0xffffff;
				starVect.size = 2 * pxRatio;//Math.floor(10 * (2 + (1 / mag))) / 10;
				//starColor = lightenDarkenColor(starColor, Math.pow(1.5/mag, 1.1));
				

				starVect.spectralIndex = 0.5;//star[SPECT];

				if(name) namedStars[name] = starVect;

				//a voir comment ajuster dans le color ramp
				starVect.spectralLookup = Math.random();//0.5;

				pGeo.vertices.push( starVect );
				pGeo.colors.push( new THREE.Color(starColor) );
			}



			var shaderMaterial = new THREE.ShaderMaterial( {
				uniforms: 		shaderAttr.uniforms,
				attributes:     shaderAttr.attributes,
				vertexShader:   shaders.vertex,
				fragmentShader: shaders.fragment,
				blending: 		THREE.AdditiveBlending,
				depthTest: 		false,
				depthWrite: 	false,
				transparent:	true,
			});
			//container.shaderMaterial = shaderMaterial;

			var particleSystem = new THREE.ParticleSystem( pGeo, shaderMaterial );
			particleSystem.dynamic = false;
			particleSystem.renderDepth = 1e20;

			//	set the values to the shader
			var values_size = shaderAttr.attributes.size.value;
			var values_color = shaderAttr.attributes.customColor.value;
			var values_spectral = shaderAttr.attributes.colorIndex.value;

			for( var v = 0; v < pGeo.vertices.length; v++ ) {
				values_size[ v ] = pGeo.vertices[v].size;
				values_color[ v ] = pGeo.colors[v];
				values_spectral[ v ] = pGeo.vertices[v].spectralLookup;
			}


			rendered.add( particleSystem );
			//rendered.add( container );
			drawConstellations();
		};

		var MilkyWay = {
			dataSrc : 'js/orbit/data/milkyway.json',
			//dataSrc : 'js/orbit/data/milkyway_heasarc_468k.json',
			init : function(size){


				// create the particle system
				rendered = this.displayObj = new THREE.Object3D();
				//var particleSystem = new THREE.ParticleSystem(particles, pMaterial);
				rendered.rotation.x = -((23+(26/60)+(21/3600)) * ns.DEG_TO_RAD);

				var onDataLoaded = $.ajax({
					url : this.dataSrc,
					dataType : 'json'
				});

				var onShaderLoaded = ShaderLoader('stars');
				
				var onReady = $.Deferred();
				$.when(onShaderLoaded, onDataLoaded).then(function(shaderResponse, dataResponse){
					generateStars(shaderResponse, dataResponse[0], size);
					onReady.resolve();
				});

				return onReady.promise();

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