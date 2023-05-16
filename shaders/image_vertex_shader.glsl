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

  float epsilon = 0.0001;

  vec3 normal = normalize(cross(position - position_right, position - position_down));

  if(gl_VertexID / int(size.x) == int(size.y) - 1)
  {
    normal = normalize(cross(position - position_left, position - position_up));
  }

  i_normal = (u_worldInverseTranspose * vec4(normal, 1)).xyz;

  i_color = vec4(0.3 * vec3(1., 1., 1.), 1.);  // step(sq(position), sq(100.))
}
