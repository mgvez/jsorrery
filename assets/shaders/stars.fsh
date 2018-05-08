
uniform vec3 color;
uniform sampler2D starTexture;

varying vec3 vColor;

void main() {

	vec4 mixColor = vec4( color * vColor, 1 );
	vec4 colorFinal = texture2D(starTexture, gl_PointCoord ) * mixColor;
	gl_FragColor = colorFinal;
	
}