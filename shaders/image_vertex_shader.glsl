#version 300 es

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

uniform vec2 size;

in vec3 position;
// in vec3 normal;
in vec3 position_right;
in vec3 position_down;

out vec3 i_normal;
out vec4 i_color;

#define sq(x) dot(x, x)

void main() {
  gl_PointSize = 4.;

  gl_Position = u_worldViewProjection * vec4(position, 1) / vec4(1, 1, 100, 1);

  float epsilon = 0.0001;

  vec3 normal = normalize(cross(position - position_right, position - position_down));

  i_normal = (u_worldInverseTranspose * vec4(normal, 1)).xyz;

  i_color = vec4(vec3(0.5, 0.5, 0.5), 1.);  // step(sq(position), sq(100.))
}
