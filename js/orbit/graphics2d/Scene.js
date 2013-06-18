
define(
	[
		'orbit/NameSpace',
		'jquery',
		'_',
		'orbit/graphics2d/Body'
	], 
	function(ns, $, _, BodyGraphics){

		return {
			createStage : function() {
				this.bodies = [];

				this.center = {
					x : this.width / 2,
					y : this.height / 2
				};

				var canvas = $('<canvas id="universe" width="'+this.width+'" height="'+this.height+'">').appendTo('body');
				this.stage = new createjs.Stage("universe");

				this.root = new createjs.Container();
				this.stage.addChild(this.root);

			},

			setDimension : function(largestSMA, largestRadius) {

				this.width = $(window).width();
				this.height = $(window).height();
				
				var nPixPerAU = ((this.height / 2) - 20) / (largestSMA / ns.AU);
				var nkmPerPix = ns.AU / nPixPerAU;
				BodyGraphics.nmPerPix = this.nmPerPix = nkmPerPix * 1000;

				var largestPxRadius = largestRadius / nkmPerPix;
				if(largestPxRadius < ns.largestBodyMinimalSize) {
					largestPxRadius = ns.largestBodyMinimalSize;
				}
				this.radiusKmPerPix = largestRadius / largestPxRadius;
			},

			draw : function(){

				//lock to central body
				var centralPos = BodyGraphics.getPixelCoords(ns.U.getBody().position);
				this.root.x = -centralPos.x + this.center.x;
				this.root.y = -centralPos.y + this.center.y;

				$.each(this.bodies, function(n, b){
					b.drawMove();
				});

				this.stage.update();
				if(this.playing) setTimeout(this.draw.bind(this), 30);

			},

			addBody : function(celestialBody) {
				var graphics = Object.create(BodyGraphics);

				var pxRadius = celestialBody.radius / this.radiusKmPerPix;
				pxRadius = pxRadius < ns.smallestBodyMinimalSize ? ns.smallestBodyMinimalSize : pxRadius;
				graphics.pxRadius = pxRadius;

				graphics.init(celestialBody);
				this.bodies.push(graphics);
				this.root.addChild(graphics.getRoot());
			}
		};

	}
);