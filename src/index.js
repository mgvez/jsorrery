
import $ from 'jquery';
import 'style-loader!./scss/master.scss';

import JSOrrery from './core/JSOrrery';

//shim jquery plugins
window.$ = $;
require('jquery-mousewheel');

if (!window.WebGLRenderingContext) {
	const msgCont = (document.querySelectorAll('#preload .title'))[0];
	msgCont.innerHTML = '<h3>Your browser does not support WebGL. Please visit <a href="http://get.webgl.org/">webgl.org</a></h3>';
}

window.JSOrrery = JSOrrery;
if (window.onJsOrreryLoaded) window.onJsOrreryLoaded(JSOrrery);
