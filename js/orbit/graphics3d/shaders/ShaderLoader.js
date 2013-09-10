
define(
	[
		'orbit/NameSpace',
		'jquery'
	], 
	function(ns, $) {
	var PATH = 'shaders/';

	var shaderTypes = {vsh:'vertex', fsh:'fragment'};

	var ShaderLoader = function(shader){
		
		var dfds = [];
		$.each(shaderTypes, function(ext, type){
			dfds[type] = $.ajax({
				url : PATH + shader + '.'+ext,
				dataType : 'text'
			});
		});

		var finalDfd = $.Deferred();
		$.when(dfds.vertex, dfds.fragment).then(function(vsh, fsh){
			return finalDfd.resolve({vertex:vsh[0], fragment:fsh[0]});
		});

		return finalDfd.promise();

	};

	return ShaderLoader;
	
});