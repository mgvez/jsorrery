
varying vec2 vPxScreenPosition;

void main() {
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	vPxScreenPosition = vec2(gl_Position.x / gl_Position.z, gl_Position.y / gl_Position.z);
}