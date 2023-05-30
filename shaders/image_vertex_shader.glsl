#version 300 es

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

uniform ivec2 size;

in vec3 position;
// in vec3 normal;
in vec3 position_right;
in vec3 position_down;
in vec3 position_left;
in vec3 position_up;

out vec3 i_normal;
out vec4 i_color;

#define sq(x) dot(x, x)

void main() {
  gl_Position = u_worldViewProjection * vec4(position, 1) / vec4(1, 1, 100, 1);

  vec2 uv = vec2(gl_VertexID % size.x, gl_VertexID / size.x) / vec2(size - 1);

  vec3 normal = normalize(
    (1. - uv.y) * (1. - uv.x) * cross(position - position_right, position - position_down) +
    (1. - uv.y) * uv.x        * cross(position - position_down, position - position_left) +
    uv.y * uv.x               * cross(position - position_left, position - position_up) +
    uv.y * (1. - uv.x)        * cross(position - position_up, position - position_right)
  );

  i_normal = (u_worldInverseTranspose * vec4(normal, 1)).xyz;

  i_color = vec4(0.3 * vec3(1., 1., 1.), 1.);  // step(sq(position), sq(100.))
}
