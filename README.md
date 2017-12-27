# jsOrrery

jsOrrery is a Solar System / orbital mechanics simulation, or orrery, that I wrote in WebGL and Javascript. The main feature of jsOrrery is that the planets positions are accurate in regards to the date you set, and it has the consequence that you can observe things that happen in the real Solar System.

See the project live at [orrery.com] (http://orrery.com). Thanks to [@neave] (https://twitter.com/neave) for the domain :)

# Usage

The directory named `dist` contains the built app. The html file is an example of jsOrrery placed in a page. Basically, you link jsOrrery's js and css files in your HTML file and call the app.

As soon as jsOrrery is loaded, it calls a function `window.onJsOrreryLoaded` if it exists, with JSOrrery class as param. JSOrrery is also accessible through the global `window.jsOrrery` variable. To init the app, you just create a new instance.

```
const jsOrrery = new JSOrrery();
```

## Options

If you want to customize how jsOrrery behaves, you can pass a config object to its init method.

## Building the app

You can also use webpack to display the app in a local environment with `npm start`, which will then make the orrery available at http://localhost:2018. To build the js, you can run webpack directly in the terminal, for example `env NODE_ENV=production webpack`.

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
