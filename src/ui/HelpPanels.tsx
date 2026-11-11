import type { ReactNode } from 'react';
import { useGuiState } from './OrreryContext';
import { onActivateKey } from './controls';

function ScenarioHelp() {
	const scenarios = useGuiState(state => state.scenarios);
	return (
		<>
			<p>The available scenarios are in fact collections of numbers that describe celestial bodies and their position. These numbers are coming, for the most part, from Nasa's websites. Their accuracy is quite impressive, more than enough for the context of this simulation. The picture that you see on any given date represents what the real Solar System looked like on that date.</p>
			{scenarios.map(scenario => (
				<div key={scenario.name}>
					<h3>{scenario.title}</h3>
					{/* scenario descriptions are static html from the scenario files */}
					<p dangerouslySetInnerHTML={{ __html: scenario.help }} />
				</div>
			))}
		</>
	);
}

const HELP_CONTENTS: Record<string, { title: string; content: ReactNode }> = {
	helpScenario: {
		title: 'Scenario',
		content: <ScenarioHelp />,
	},
	helpDate: {
		title: 'Date',
		content: (
			<>
				<p>The <a href="http://en.wikipedia.org/wiki/Orbital_elements" target="_blank" rel="noreferrer">orbital elements</a> of the planets are used to calculate their original position when picking a date. These calculations produce a very good approximation of the positions : you can compare the stars and constellations that you see in the background from other sources, provided that you place the point of view on The Earth.</p>
				<p>Some scenarios are set to be animated by calculating positions from the orbital elements, but in some cases the velocity of each planet is derived from these calculations so that the positions are no longer calculated from the elements, but from the gravity that is acting between the different bodies. The calculation of these forces is also an approximation using a Quadratic integration, and its precision decays over time. This decay is more pronounced in some scenarios.</p>
				<p>You can find on the internet the dates of celestial events, for example eclipses or lunar phases, and check if you can observe them in this simulation.</p>
				<p>Please note that I use the Gregorian calendar for all dates, whereas Nasa use the Julian calendar for dates before the Gregorian reform (before 1582-10-15).</p>
				<p>It is also worth noting that I use the ELP2000-85 theory to compute the Moon's position, which is not the exact same theory used by Nasa to compute its eclipse canon, so that there are small differences in the position of the Moon, particularly for very ancient dates.</p>
			</>
		),
	},
	helpLookFrom: {
		title: 'Point of view',
		content: (
			<>
				<p>This option makes it possible to place the camera at the position of a planet of your choice, so you'd see the other planets from the point of view of the chosen one. From there you can zoom by scrolling.</p>
				<p>The Free Camera is a camera that floats into space, and that you can move by scrolling and dragging. This camera always revolve around a point specified in the "look at" option field.</p>
			</>
		),
	},
	helpLookAt: {
		title: 'Look at',
		content: (
			<>
				<p>You can make your selected camera look at a planet of your choice, so that it always will be centered in your viewport.</p>
				<p>If you place the camera from the viewpoint of a planet and look at another one, the latter's path will be traced relative to the former's position. This feature is useful to observe the <a href="http://en.wikipedia.org/wiki/Apparent_retrograde_motion" target="_blank" rel="noreferrer">apparent retrograde motion</a> of the planets relative to the Earth.</p>
			</>
		),
	},
	helpScale: {
		title: 'Planet scale',
		content: (
			<p>When the scale is at 1x, the planets sizes are in 1:1 scale to the size of the orbits, and of the universe. Since the distances in the Solar System are so huge, we can't even see the planets at this scale, so I made it possible to make the planets larger to see them more easily. I left the possibility to view them at their real size, because I feel it gives a better hint about the vastness of our Solar System.</p>
		),
	},
	helpDeltaT: {
		title: 'Speed',
		content: (
			<p>Move the slider to change animation speed. Depending on the scenario, precision of positions can decay with increased speed. You can also start / stop the animation with the P key.</p>
		),
	},
	helpCredits: {
		title: 'Credits',
		content: (
			<>
				<p>
					<a href="http://la-grange.ca"><img src="./assets/img/logo-la-grange.png" alt="La Grange" /></a>
				</p>
				<p>Programming by <a href="http://lab.la-grange.ca/en/martin-vezina">Martin Vézina</a>, <a href="http://la-grange.ca">La Grange</a>, 2013-2017.</p>
				<p><a href="https://twitter.com/m_vezina">Follow @m_vezina</a></p>
				<p>See project on Github at <a href="https://github.com/mgvez/jsorrery">https://github.com/mgvez/jsorrery</a></p>

				<h3>Special thanks</h3>
				<ul>
					<li>Planets orbital elements from Nasa's <a href="http://ssd.jpl.nasa.gov/?planet_pos">Jet Propulsion Laboratory</a>.</li>
					<li>I learned about calculating positions from orbital elements by reading these documents by <a href="http://www.stargazing.net/kepler/ellipse.html">Keith Burnett</a>, <a href="http://www.stjarnhimlen.se/comp/tutorial.html">Paul Schlyter</a> and <a href="http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf">E M Standish (JPL)</a>.</li>
					<li>Planet texture maps are a courtesy of <a href="http://planetpixelemporium.com/planets.html">James Hastings-Trew</a>.</li>
					<li>Stars coordinates from <a href="http://astronexus.com/">AstroNexus</a> and <a href="http://heasarc.gsfc.nasa.gov/docs/archive.html">Nasa</a>.</li>
					<li>David Eagle for orbital calculations of the moon, based on "Lunar Tables and Programs From 4000 B.C. TO A.D. 8000" by Michelle Chapront-Touze and Jean Chapront. See <a href="http://www.mathworks.com/matlabcentral/fileexchange/39130-orbital-elements-of-the-moon">mathworks.com</a>.</li>
					<li><a href="http://www.braeunig.us/apollo/">Bob Braeunig</a> for calculations of Apollo missions trans lunar injection trajectories.</li>
					<li>Quadratic integrations from <a href="http://orbit.medphys.ucl.ac.uk/">Orbiter</a>'s documentaion by Martin Schweiger.</li>
					<li><a href="http://clowder.net/hop/index.html">Hop David</a> for vis viva calculation of velocity.</li>
					<li>I have found answers to many questions on random places across the internetz, places like <a href="http://stackoverflow.com">StackOverflow</a> or <a href="http://www.orbiter-forum.com/">Orbiter Forum</a>. There are a lot of helpful people out there.</li>
					<li>Some techniques are inspired by Michael Chang's <a href="http://www.html5rocks.com/en/tutorials/casestudies/100000stars/">tutorial</a> of <a href="http://workshop.chromeexperiments.com/stars/">100,000 stars</a></li>
					<li>And of course, many thanks to <a href="http://www.mrdoob.com/">Mr Doob</a> for the excellent <a href="http://threejs.org/">three.js</a></li>
				</ul>
			</>
		),
	},
};

interface HelpPanelsProps {
	shown: string | null;
	onClose: () => void;
}

/** the help texts, one panel at a time */
export default function HelpPanels({ shown, onClose }: HelpPanelsProps) {
	return (
		<>
			{Object.entries(HELP_CONTENTS).map(([id, { title, content }]) => (
				<div key={id} className={`helpContent${shown === id ? ' shown' : ''}`} id={id} aria-hidden={shown !== id}>
					<a className="close fa fa-close" role="button" tabIndex={0} aria-label="Close" onClick={onClose} onKeyDown={onActivateKey(onClose)}>{' '}</a>
					<h2>{title}</h2>
					{content}
				</div>
			))}
		</>
	);
}

export function isHelpPanel(id: string | undefined): id is string {
	return !!id && id in HELP_CONTENTS;
}
