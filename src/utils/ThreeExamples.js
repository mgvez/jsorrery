
const THREE = require('three');

window.THREE = THREE;

require('three.Projector');
require('three.OrbitControls');

export const Projector = window.THREE.Projector;
export const OrbitControls = window.THREE.OrbitControls;
export const Stats = require('three.Stats');
