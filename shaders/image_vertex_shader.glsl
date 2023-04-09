#version 300 es

uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
uniform mat4 rotation_4d;

uniform vec2 size;

in float vertex_index;

out vec3 i_normal;
out vec4 i_color;

#define sq(x) dot(x, x)

vec3 circle(vec2 uv)
{
  uv.y -= 0.5;
  uv *= 3.14 * vec2(2., 1);

  return vec3(cos(uv.y) * vec2(cos(uv.x), sin(uv.x)), sin(uv.y));
}

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
  // (rotation_4d * clifford_torus_4d(uv)).x = cos(uv.x) * cos(a) - cos(uv.y) * sin(a)
  // 1. - (cos(uv.x) * cos(a) - cos(uv.y) * sin(a)) = 0
  // 1. - cos(uv.x) * cos(a) + cos(uv.y) * sin(a) = 0
  // 1. - cos(uv.x) * cos(a) + cos(uv.y) * sin(a) = 0

  vec3 position = stereographic_projection(rotation_4d * clifford_torus_4d(uv));

  // position = clamp(length(position), 0., 10.) * normalize(position);

  return position;
}

vec3 torus(vec2 uv)
{
  uv *= 2. * 3.14;

  return vec3(vec2(cos(uv.x), sin(uv.x)) * (cos(uv.y) + 2.), sin(uv.y)).xzy;
}

vec3 parametric_surface(vec2 uv)
{
  return clifford_torus_3d(uv);
}

void main() {
  gl_PointSize = 4.;

  vec2 uv = vec2(mod(vertex_index, size[0]), floor(vertex_index / size[0])) / size;

  vec3 position = parametric_surface(uv);

  gl_Position = u_worldViewProjection * vec4(position, 1) / vec4(1, 1, 100, 1);

  float epsilon = 0.0001;

  i_normal = normalize(cross(position - parametric_surface(uv + vec2(epsilon, 0)), position - parametric_surface(uv + vec2(0, epsilon))));
  i_normal = (u_worldInverseTranspose * vec4(i_normal, 1)).xyz;
  // TODO: The 2 sides of a face are colored the same.

  i_color = vec4(vec3(0, 1, 0), 1.);  // step(sq(position), sq(100.))
}
