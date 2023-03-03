#version 300 es

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

in vec4 position;
in vec3 normal;

out vec3 i_normal;

void main() {
  gl_Position = u_worldViewProjection * position;
  i_normal = (u_worldInverseTranspose * vec4(normal, 0)).xyz;
}
