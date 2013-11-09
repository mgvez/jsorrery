
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/CameraManager',
		'jsorrery/graphics3d/Dimensions'
	], 
	function(ns, $, CameraManager, Dimensions) {
		'use strict';

		var EVENT_LABEL_LINE_H = 100;
		var EVENT_LABEL_MAX_ANGLE = 45;

		var labels;
		var projector;
		var sceneW;
		var sceneH;
		var halfSceneW;
		var halfSceneH;

		//project scene position to 2d screen coordinates. Returns null if position is out of screen.
		var toScreenCoords = function (pos) {
			var vector = projector.projectVector(pos, CameraManager.getCamera());
			vector.x = Math.round((vector.x + 1)/2 * sceneW);
			vector.y = Math.round(-(vector.y - 1)/2 * sceneH);/**/

			if(vector.z<1 && vector.z>0 && vector.x>0 && vector.x<sceneW && vector.y>0 && vector.y<sceneH){
				return vector;
			}
		};

		//map callback, executed at each frame for each label.
		var positionLabel = function(label){
			label.callback(this.camPos, this.fov);
		};

		//planet label specific positioning callback
		var getPlanetLabelCallback = function(el, body3d){
			var screenCoords;
			var dist;
			var visibleHeight;
			var isVisible;

			return function(camPos, fov){
				screenCoords = toScreenCoords(body3d.getPosition());
				if (screenCoords) {
					el.css({left : screenCoords.x+'px', top : screenCoords.y+'px'}).show();

					dist = body3d.root.position.distanceTo(camPos);
					visibleHeight = 2 * Math.tan( fov / 2 ) * dist;
					//if planet is larger than 10% of screen height, hide label
					isVisible = (body3d.getPlanetStageSize() / visibleHeight) < 0.1;
					if (isVisible !== el.data('shown')) {
						el.data('shown', isVisible);
						TweenMax.killTweensOf(el);
						TweenMax.to(el, 1, {css:{opacity: isVisible ? 1 : 0}});
					}

				} else {
					el.hide();
				}
			}
		};

		//event label specific positioning callback
		var getEventLabelCallback = function(el, pos, relativeTo){
			var line = el.find('.line');
			var tx = el.find('.tx');
			var txHalfW = tx.outerWidth()/2;
			var txH = tx.outerHeight();
			var screenCoords;
			var angle;
			var radAngle;
			var tipPos;
			var cssRot;
			return function(){
				screenCoords = toScreenCoords(
					Dimensions.getScaled(pos.clone().add(relativeTo.getPosition()))
				);
				if (screenCoords) {
					angle = ((screenCoords.x - halfSceneW) / halfSceneW) * EVENT_LABEL_MAX_ANGLE;
					radAngle = angle * ns.DEG_TO_RAD;
					tipPos = {x: Math.sin(radAngle) * EVENT_LABEL_LINE_H, y: -Math.cos(radAngle) * EVENT_LABEL_LINE_H};
					cssRot = 'rotate('+angle+'deg)';

					line.css({WebkitTransform : cssRot, '-moz-transform' : cssRot, left : tipPos.x, top : tipPos.y});
					tx.css({left : tipPos.x-txHalfW, top : tipPos.y-txH});
					el.css({left : screenCoords.x+'px', top : screenCoords.y+'px'}).show();
				} else {
					el.hide();
				}
			};
		};


		return {
			init : function(w, h){
				if (labels) this.kill();
				labels = [];
				projector = projector || new THREE.Projector();
				sceneW = $(window).width();
				sceneH = $(window).height();
				halfSceneW = sceneW / 2;
				halfSceneH = sceneH / 2;
			},

			addPlanetLabel : function(title, body3d){
				var el = $('<div class="planetSpot" data-shown="true"><div class="planetLabel">'+title+'</div></div>').appendTo('body');
				
				labels.push({
					el : el,
					callback : getPlanetLabelCallback(el, body3d)
				});
			},

			addEventLabel : function(tx, pos, relativeTo){
				var el = $('<div class="eventLabel"><div class="line"></div><div class="tx">'+tx+'</div></div>').appendTo('body');
				labels.push({
					el: el,
					callback : getEventLabelCallback(el, pos, relativeTo)
				});
			},

			draw : function(camPos, fov){
				labels.map(positionLabel, {camPos:camPos, fov:fov});
			},

			kill : function(){
				labels && labels.map(function(label){
					label.el.remove();
				});
				labels = null;
			}

		};
	}
);