
define(
	[
		'orbit/NameSpace',
		'jquery'
	],
	function(){

		return {
			init : function(universe){

				var startBtn = $('<button class="start">start/stop</button>').appendTo('body');
				startBtn.on('click', function(){
					universe.playing = !universe.playing;
					universe.tick();
				}.bind(this));

			}
		};
	}
);