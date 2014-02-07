
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'_'
	], 
	function(ns, $){
		'use strict';
		return {
			init : function(renderer, params) {
				this.i = 0;
				this.renderer = renderer;

				this.params = _.extend({
					interval : 5
				}, params);

				return this;
			},

			capture : function(){
				
				if(this.i % this.params.interval === 0){
					var img = this.renderer.domElement.toDataURL();
					$.ajax({
						type:'post',
						url:'/_workdir/save.php',
						data : {
							im : img,
							i : this.i
						},
						success:function(data){
							//console.log(data)
						},
						error:function(a, b, c){
							console.log(a,b,c);
						}
					});
				}
				this.i++;
			}
		};

	}
);