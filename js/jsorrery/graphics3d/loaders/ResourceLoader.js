
define(
	[
		'jsorrery/NameSpace',
		'jquery'
	], 
	function(ns, $) {

		var SHADER_PATH = 'shaders/';
		var SHADER_TYPES = {vsh:'vertex', fsh:'fragment'};

		var allLoaders;

		var ResourceLoader = {
			
			reset : function(){
				allLoaders = [];
			},

			getOnReady : function(){
				return $.when.apply($, allLoaders);
			},

			loadTexture : function(mapSrc){
			
				var dfd = $.Deferred();
				allLoaders.push(dfd.promise());

				return THREE.ImageUtils.loadTexture(mapSrc, new THREE.UVMapping(), function(){
					dfd.resolve();
				});

			},

			loadJSON : function(dataSrc){
				var onDataLoaded = $.ajax({
					url : dataSrc,
					dataType : 'json'
				});

				allLoaders.push(onDataLoaded.promise());
				return onDataLoaded;
			},

			loadShaders : function(shader){
			
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

				allLoaders.push(finalDfd.promise());
				return finalDfd.promise();

			}
		};

		return ResourceLoader;
	
	}
);