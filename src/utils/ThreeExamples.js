
const THREE = require('three');

window.THREE = THREE;
// console.log(THREE);

require('three.Projector');
require('three.OrbitControls');
require('three.Stats');

export const Projector = window.THREE.Projector;
export const OrbitControls = window.THREE.OrbitControls;
export const Stats = require('three.Stats');
