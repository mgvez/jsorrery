

attribute float size;
attribute vec3 customColor;
attribute float colorIndex;

varying vec3 vColor;
varying float dist;
varying float pSize;

varying float starColorLookup;

void main() {

	vColor = customColor;

	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

	dist = length( mvPosition.xyz );

	gl_PointSize = size ;

	gl_Position = projectionMatrix * mvPosition;

	pSize = gl_PointSize;
	starColorLookup = colorIndex;

}