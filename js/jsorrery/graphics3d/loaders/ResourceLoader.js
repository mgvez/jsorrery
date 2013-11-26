
define(
	[
		'jsorrery/NameSpace',
		'jquery'
	], 
	function(ns, $) {

		var SHADER_PATH = 'shaders/';
		var SHADER_TYPES = {vsh:'vertex', fsh:'fragment'};

		var allLoaders = {};
		var currentScenarioLoaders;

		var getCached = function(id){
			if(allLoaders[id]){
				currentScenarioLoaders.push(allLoaders[id]);
				return allLoaders[id];
			}
		};

		var ResourceLoader = {
			
			reset : function(){
				currentScenarioLoaders = [];
			},

			getOnReady : function(){
				return $.when.apply($, currentScenarioLoaders);
			},

			loadTexture : function(mapSrc){
				
				var dfd = $.Deferred();
				currentScenarioLoaders.push(dfd.promise());

				return THREE.ImageUtils.loadTexture(mapSrc, new THREE.UVMapping(), function(){
					dfd.resolve();
				});

			},

			loadJSON : function(dataSrc){

				var onDataLoaded = getCached(dataSrc);
				if(onDataLoaded) return onDataLoaded;

				onDataLoaded = $.ajax({
					url : dataSrc,
					dataType : 'json'
				});

				allLoaders[dataSrc] = onDataLoaded.promise();
				currentScenarioLoaders.push(onDataLoaded.promise());
				return onDataLoaded;
			},

			loadShaders : function(shader){
				var shaderId = 'shader.'+shader;

				var shaderDfd = getCached(shaderId);
				if(shaderDfd) return shaderDfd;

				var dfds = [];
				$.each(SHADER_TYPES, function(ext, type){
					dfds[type] = $.ajax({
						url : SHADER_PATH + shader + '.'+ext,
						dataType : 'text'
					});
				});

				var finalDfd = $.Deferred();
				$.when(dfds.vertex, dfds.fragment).then(function(vsh, fsh){
					return finalDfd.resolve({vertex:vsh[0], fragment:fsh[0]});
				});

				allLoaders[shaderId] = finalDfd.promise();
				currentScenarioLoaders.push(finalDfd.promise());
				return finalDfd.promise();

			}
		};

		return ResourceLoader;
	
	}
);