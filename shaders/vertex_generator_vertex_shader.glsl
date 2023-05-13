#version 300 es

uniform mat4 rotation_4d;

uniform vec2 size;

in float vertex_index;

out vec3 position;
// out vec3 normal;

#define sq(x) dot(x, x)

vec4 clifford_torus_4d(vec2 uv)
{
  uv -= 0.5;
  uv *= 3.14 * 2.;

  return vec4(cos(uv.x), sin(uv.x), cos(uv.y), sin(uv.y));
}

vec3 stereographic_projection(vec4 pos_4d)
{
  return pos_4d.yzw / (1. - min(1.01 * pos_4d.x, 1.));
}

vec3 clifford_torus_3d(vec2 uv)
{
  return stereographic_projection(rotation_4d * clifford_torus_4d(uv));
}

vec3 torus(vec2 uv)
{
  uv *= 2. * 3.14;

  return vec3(vec2(cos(uv.x), sin(uv.x)) * (cos(uv.y) + 2.), sin(uv.y));
}

vec3 parametric_surface(vec2 uv)
{
  return clifford_torus_3d(uv);
}

const float epsilon = 0.0001;

void main() {
  vec2 uv = vec2(mod(vertex_index, size[0]), floor(vertex_index / size[0])) / size;

  position = parametric_surface(uv);
  // normal = normalize(cross(position - parametric_surface(uv + vec2(epsilon, 0)), position - parametric_surface(uv + vec2(0, epsilon))));
}
