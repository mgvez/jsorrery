
define(
	[
		'jsorrery/NameSpace',
		'jquery',
		'jsorrery/graphics3d/OrbitLine',
		'three'
	], 
	function(ns, $, OrbitLine) {
		'use strict';
		

		var BodyOrbit = {
			
			init : function(body3d) {
				this.body3d = body3d;
				this.celestial = body3d.celestial;
				this.setOrbitLines();
			},

			setOrbitLines : function(){
				var orbitVertices = this.celestial.getOrbitVertices(false);
				
				if(orbitVertices){
					//get orbit line calculated from precise locations instead of assumed ellipse
					if(!this.perturbedOrbitLine) {
						this.perturbedOrbitLine = Object.create(OrbitLine);
						this.perturbedOrbitLine.init(this.celestial.name, this.celestial.color);
					}
					this.perturbedOrbitLine.setLine(orbitVertices);

					//get new orbit vertices, but elliptical (not perturbed)
					orbitVertices = this.celestial.getOrbitVertices(true);

					//does this body revolves around the system's main body? If so, draw its ecliptic
					if(!this.celestial.relativeTo || this.celestial.relativeTo == ns.U.getBody().name){
						var eclipticVertices = _.clone(orbitVertices);
						eclipticVertices = _.map(eclipticVertices, function(val){ return val.clone().negate();});
						if(!this.eclipticLine) {
							this.eclipticLine = Object.create(OrbitLine);
							this.eclipticLine.init(this.celestial.name, ns.U.getBody().color);
						}
						this.eclipticLine.setLine(eclipticVertices);
					}/**/

					if(!this.ellipticOrbitLine) {
						this.ellipticOrbitLine = Object.create(OrbitLine);
						this.ellipticOrbitLine.init(this.celestial.name, this.celestial.color);
					}
					this.ellipticOrbitLine.setLine(orbitVertices);

					if(this.celestial.calculateFromElements) {
						this.recalculateListener = function(){
							this.recalculateOrbitLine(false);
						}.bind(this);
						this.celestial.addEventListener('revolution', this.recalculateListener);
					}
					this.orbitLine = this.celestial.calculateFromElements ? this.perturbedOrbitLine : this.ellipticOrbitLine;

				}
			},

			recalculateOrbitLine : function(isForced){
				if(!isForced && (!this.perturbedOrbitLine || !this.celestial.calculateFromElements)) return;
				//console.log('recalculate '+this.celestial.name+' perturbed:'+this.celestial.calculateFromElements);
				var orbitVertices = this.celestial.getOrbitVertices(!this.celestial.calculateFromElements);
				if(orbitVertices){
					var wasAdded = this.orbitLine.added;
					this.hideOrbit();
					this.orbitLine.setLine(orbitVertices);
					if(wasAdded){
						this.showOrbit();
					}
				}
			},

			showEcliptic : function(){
				if(!this.eclipticLine) return;
				this.eclipticLine.added = true;
				this.body3d.getDisplayObject().add(this.eclipticLine.getDisplayObject());
			},

			hideEcliptic : function(){
				if(!this.eclipticLine) return;
				this.eclipticLine.added = false;
				this.body3d.getDisplayObject().remove(this.eclipticLine.getDisplayObject());
			},

			showOrbit : function(){
				if(!this.orbitLine) return;
				this.orbitLine.added = true;
				this.getOrbitContainer().add(this.orbitLine.getDisplayObject());
				
				//this.getOrbitContainer().add(this.ellipticOrbitLine.getDisplayObject());
			},

			hideOrbit : function(){
				if(!this.orbitLine) return;
				this.orbitLine.added = false;
				this.getOrbitContainer().remove(this.orbitLine.getDisplayObject());
				//this.getOrbitContainer().remove(this.ellipticOrbitLine.getDisplayObject());
			},

			//the orbit is drawn around the main body OR the universe (scene)
 			getOrbitContainer : function(){
 				//return ns.U.getScene().getRoot();
				var thisCentralBody;
				var centralName = this.celestial.traceRelativeTo || this.celestial.relativeTo;
				if(centralName) {
					thisCentralBody = ns.U.getBody(centralName);
				}
				return (thisCentralBody && thisCentralBody.getBody3D().getDisplayObject()) || ns.U.getScene().getRoot();
 			},

			kill : function(){
				this.recalculateListener && this.celestial.removeEventListener('revolution', this.recalculateListener);
			}

		};

		return BodyOrbit;
	}
);