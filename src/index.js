
import JSOrrery from './JSOrrery';

if (!window.WebGLRenderingContext) {
	const msgCont = (document.querySelectorAll('#preload .title'))[0];
	msgCont.innerHTML = '<h3>Your browser does not support WebGL. Please visit <a href="http://get.webgl.org/">webgl.org</a></h3>';
}

JSOrrery.init();
