
const THREE = require('three');

window.THREE = THREE;

require('three.Projector');
require('three.OrbitControls');
require('three/examples/js/SkyShader.js');

export const Sky = window.THREE.Sky;

export const Projector = window.THREE.Projector;
export const OrbitControls = window.THREE.OrbitControls;
export const Stats = require('three.Stats');
