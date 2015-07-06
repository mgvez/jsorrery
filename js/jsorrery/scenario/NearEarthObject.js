/** 

mass : kg
dist : km
apeed : km/s
radius: km

*/

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies',
		'vendor/jquery.xdomainajax'
	], 
	function(ns, common) {


		var bodies = {};

		var neoPath = 'http://neo.jpl.nasa.gov/cgi-bin/neo_ca?type=NEO&hmax=all&sort=date&sdir=ASC&tlim=far_future&dmax=0.05AU&max_rows=0&action=Display+Table&show=1';

		var onLoadError = function(jqXHR, textStatus, errorThrown){
			alert('Error loading NEO definitions. See console.');
			console.log(textStatus, errorThrown);
			console.log(jqXHR);
		};

		

		var onListLoaded = function(res) {
			var html = res.results && res.results[0];
			if(!html) return onLoadError(res, null, 'No result');
			
			var reg = /http\:\/\/ssd\.jpl\.nasa\.gov\/sbdb\.cgi\?sstr\=([^";]+)/g;
			var matches = html.match(reg);
			if(!matches) return onLoadError(res, null, 'No links found');

			var allReady;
			for(var i = 0; i<10 && i<matches.length; i++) {
				(function(i){
					var url = matches[i];
					var name = decodeURI(url.substring(url.indexOf('sstr=')+5));

					var loadDef = $.ajax({
						url: url.replace(' ', ''),
						type: 'get',
						dataType: 'html',
						context: {
							name: name,
							url: url
						},
					});

					loadDef.fail(onLoadError);
					loadDef.then(onObjectLoaded);
					allReady = (allReady && allReady.then(function() {
						return loadDef.promise();
					})) || loadDef;
					
				})(i);
			}
			return allReady.promise();
		};


		var onObjectLoaded = function(res) {
			var html = res.results && res.results[0];
			if(!html) return onLoadError(res, null, 'No result');

			var startStr = 'Orbital Elements at Epoch';
			var from = html.indexOf(startStr);
			var to = html.indexOf('show covariance matrix');

			html = html.substring(from, to);

			//find epoch
			var epoch = Number(html.substring(startStr.length, html.indexOf('(')).replace(/\s/g, ''));
			var tsSinceJ2000 = (epoch-2451545) * (60*60*24*1000);
			epoch = ns.J2000.getTime() + tsSinceJ2000;
			var epochDate = new Date(epoch);

			//parse table containing elements. Its the second one in the substring.
			from = html.indexOf('<table', html.indexOf('<table')+1);
			to = html.indexOf('</table>');
			
			html = html.substring(from, to+9);
			var table = $(html);
			//console.log(table);

			var orbitalElements = {};
			var rows = table.find('tr');
			rows.each(function(i, row){
				var cells = $(row).find('td');
				var key = null;
				cells.each(function(j, cell){
					cell = $(cell);
					var content = cell.text().trim();
					//orbital element ky is in cell 0
					if(j === 0){
						key = content;
					}
					//value is in cell 1
					if(j === 1) {
						//period has two values, the first one is "days"
						if(key==='period'){
							//console.log(content);
							content = cell.html().trim().replace('<br>', '--').replace(/(<([^>]+)>)/ig,"");
							content = content.split(/--/);
							content = content[0] && content[0].trim();
						}
						orbitalElements[key] = Number(content);
					}
				});
			});

			bodies['_'+this.name] = _.extend({
				title : this.name,
				orbit: {
					epoch : epochDate,
					base : {
						a : orbitalElements.a * ns.AU,
						e : orbitalElements.e,
						w : orbitalElements.peri,
						M : orbitalElements.M,
						i : orbitalElements.i,
						o : orbitalElements.node
					},
					day : {
						M : 360 / orbitalElements.period
					}	
				}
			}, baseNEO);

			//console.log(orbitalElements);
			//$('<div class="debug">').append(table).appendTo('body');
		};



		var baseNEO = {
			mass : 1,
			radius : 2000,
			color : '#ffffff'
		};

		var cnf = {
			name : 'NEO',
			title : 'Near Earth Objects',
			load : (function(){
				var ready;
				return function(){

					if(ready) return ready.promise();
					var loaded = $.ajax({
						url: neoPath,
						type: 'get',
						dataType: 'html'
					});

					loaded.fail(onLoadError);
					ready = loaded.then(onListLoaded);
					return ready.promise();
				};
			})(),
			/*calculateAll : true,
			usePhysics : true,/**/
			commonBodies : [
				'sun',
				'mercury',
				'venus',
				'earth',
				'moon',
				'mars'
			],
			bodies : bodies,
			secondsPerTick : {min: 60, max: 3600 * 5, initial:3600},
			defaultGuiSettings : { 
				planetScale : 1
			},
			help : "This scenario shows the next 10 passages closer than 0.05 AU of near Earth objects from Nasa's Near Earth Object Project (<a href=\"http://neo.jpl.nasa.gov/\" target=\"_blank\">http://neo.jpl.nasa.gov/</a>."
		};

		return cnf;
		
	}
);