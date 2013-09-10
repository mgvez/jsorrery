
uniform vec3 color;
uniform sampler2D starTexture;
uniform sampler2D spectralLookup;
uniform float idealDepth;
uniform float blurPower;
uniform float blurDivisor;
uniform float sceneSize;
uniform float cameraDistance;
uniform float brightnessScale;

varying vec3 vColor;
varying float dist;
varying float starColorLookup;


void main() {

	//gl_FragColor = vec4( color * vColor, 1. );
	vec4 mixColor = vec4( color * vColor, 1 );

	vec4 color0 = texture2D(starTexture, gl_PointCoord ) * mixColor;

	//float clampedLookup = clamp( starColorLookup, 0., 1.0 );
	//vec2 spectralUV = vec2( 0., clampedLookup );	
	//vec4 starSpectralColor = texture2D( spectralLookup, spectralUV );


	//starSpectralColor.x = pow(starSpectralColor.x,2.);
	//starSpectralColor.y = pow(starSpectralColor.y,2.);
	//starSpectralColor.z = pow(starSpectralColor.z,2.);

	//color0.xyz *= starSpectralColor.xyz;


	//vec4 mixColor = mix( color0, starSpectralColor , 0.9);


	gl_FragColor = color0;
	
}