# jsOrrery

jsOrrery is a Solar System / orbital mechanics simulation, or orrery, that I wrote in WebGL and Javascript. The main feature of jsOrrery is that the planets positions are accurate in regards to the date you set, and it has the consequence that you can observe things that happen in the real Solar System.

See the project live at [orrery.com] (http://orrery.com). Thanks to [@neave] (https://twitter.com/neave) for the domain :)

# Usage

Run `npm run build` to produce the app in the `dist` directory; its content can be served from any path (e.g. GitHub Pages). `index.html` shows how jsOrrery is placed in a page: it loads the VSOP87 / ELP2000 data scripts, then the app, which renders in `<div id="root">`.

## Options

The initial view can be set in the query string (this is what the share link does), for example `?scenario=InnerSolarSystem&date=2017-08-21T18:25:00.000Z&lookFrom=earth&lookAt=moon&geoloc=36.9664,-87.6709&fov=2.5&cx=0&cy=0&cz=0`.

A page can also set defaults before the app starts (the query string has precedence):

```html
<script>
	window.jsOrrery = {
		defaults: {
			scenario: 'InnerSolarSystem',
			date: '2017-08-21T17:40:00.000Z',
			planetScale: 1,
			lookFrom: 'earth',
			lookAt: 'moon',
			deltaT: 20,
			geoloc: '36.9664, -87.6709',
			cameraSettings: { fov: 2.5 },
			showHelp: 'helpDate',
		},
	};
</script>
```

Available settings: `scenario`, `date`, `lookFrom`, `lookAt`, `planetScale`, `deltaT` (seconds of simulation per frame), `geoloc` (observer's position, when looking from the Earth), `cameraSettings` (`x`, `y`, `z`, `fov`) and `showHelp` (`helpScenario`, `helpDate`, `helpLookFrom`, `helpLookAt`, `helpScale`, `helpDeltaT` or `helpCredits`).

## Development

jsOrrery is written in TypeScript, with React for the user interface and three.js for the 3d scene, and built with [Vite](https://vite.dev). Requires Node.js 20 or later.

```
npm install
npm run dev        # dev server at http://localhost:2018
npm run build      # type check and production build in dist/
npm run preview    # serve the production build
npm test           # regression tests of the simulation
npm run lint
npm run typecheck
```

Static files (textures, star catalog, shaders, VSOP87 / ELP2000 series) live in `public/assets` and are copied as-is to `dist/assets`.

### Structure

- `src/core`: `Simulation` (bodies, time, gravity integration; runs without display), `Universe` (a simulation in a 3d scene, animated at each frame), `Orrery` (loads scenarios and exposes the GUI's actions), `CelestialBody`.
- `src/algorithm`: positions from orbital elements, VSOP87, gravity and quadratic integration.
- `src/scenario`: the scenarios and the bodies' definitions (orbital elements, masses, textures...).
- `src/graphics3d`, `src/graphics2d`: the three.js scene, cameras, orbit lines, labels.
- `src/ui`: the React GUI. It reads the state from a small store (`src/state`) that the engine updates, and calls the `Orrery`'s methods.
- `tests`: the simulation is checked against positions computed by the original JavaScript implementation (see `tests/fixtures/README.md`).

# Credits

* Planets orbital elements were taken from Nasa's [Jet Propulsion Laboratory](http://ssd.jpl.nasa.gov/?planet_pos).
* I learned about calculating positions from orbital elements by reading these documents by [Keith Burnett](http://www.stargazing.net/kepler/ellipse.html), [Paul Schlyter](http://www.stjarnhimlen.se/comp/tutorial.html) and [E M Standish (JPL)](http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf).
* Planet texture maps are a courtesy of [James Hastings-Trew](http://planetpixelemporium.com/planets.html).
* Stars coordinates from [AstroNexus](http://astronexus.com/) and [Nasa](http://heasarc.gsfc.nasa.gov/docs/archive.html).
* David Eagle for basic orbital calculations of the Moon, based on "Lunar Tables and Programs From 4000 B.C. TO A.D. 8000" by Michelle Chapront-Touze and Jean Chapront (Bureau des Longitudes). See [mathworks.com](http://www.mathworks.com/matlabcentral/fileexchange/39130-orbital-elements-of-the-moon).
* Precise lunar positions from ELP2000-85 theory by Michelle Chapront-Touze and Jean Chapront (Bureau des Longitudes). Javascript code ported from Fortran example found at [http://vizier.cfa.harvard.edu/viz-bin/ftp-index?VI/79](http://vizier.cfa.harvard.edu/viz-bin/ftp-index?VI/79).
* Earth precise position from VSOP87, Bretagnon P., Francou G., (Bureau des Longitudes), from examples found at [https://www.caglow.com](https://www.caglow.com/)
* Nasa/JPL's HORIZONS was used extensively to test my results. [https://ssd.jpl.nasa.gov/horizons.cgi](https://ssd.jpl.nasa.gov/horizons.cgi)
* Delta T computations from Nasa's eclipse website [https://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html](https://eclipse.gsfc.nasa.gov/SEcat5/deltatpoly.html)
* Bob Braeunig for calculations of [Apollo missions free return trajectories](http://www.braeunig.us/apollo/).
* Quadratic integrations from [http://orbit.medphys.ucl.ac.uk/](Orbiter)'s documentaion by Martin Schweiger.
* Some techniques are inspired by Michael Chang's [tutorial](http://www.html5rocks.com/en/tutorials/casestudies/100000stars/) of [100,000 stars](http://workshop.chromeexperiments.com/stars/)
* And of course, many thanks to [Mr Doob](http://www.mrdoob.com/) for the excellent [three.js](http://threejs.org/)

More details on La Grange's blog at <a href="http://lab.la-grange.ca/en/jsorrery">http://lab.la-grange.ca/en/jsorrery</a>
