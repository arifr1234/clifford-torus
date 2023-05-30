#version 300 es

uniform mat4 rotation_4d;

uniform ivec2 size;
uniform ivec2 inclusive;
uniform float time;

out vec3 position;
// out vec3 normal;

#define PI 3.14159265359

#define sq(x) dot(x, x)
#define cis(x) vec2(cos(x), sin(x))

vec2 c_mul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }
vec2 c_sq(vec2 z) { return vec2(sq(z.x) - sq(z.y), 2. * z.x * z.y); }
#define c_conjugate(z) (z * vec2(1, -1))
vec2 c_div(vec2 a, vec2 b) { return c_mul(a, c_conjugate(b)) / sq(b); }

const float SQRT_5 = sqrt(5.);

vec3 boys_surface(vec2 uv)
{
  vec2 uv_size = vec2(mix(0.3, 1., 0.5 * (cos(time / 3.) + 1.)), 0.2);

  vec2 start = vec2((1. - uv_size.x) * 0.5 * (cos(time) + 1.), (1. - uv_size.y) * 0.5 * (sin(time) + 1.));

  vec2 min_point = start + vec2(0, 0.01);
  vec2 max_point = uv_size + start;
  
  vec2 normalized_uv = mix(min_point, max_point, uv);

  normalized_uv *= vec2(2. * PI, 1);
  vec2 w = normalized_uv.y * cis(normalized_uv.x);

  vec2 w_2 = c_sq(w);
  vec2 w_4 = c_sq(w_2);
  vec2 w_3 = c_mul(w_2, w);
  vec2 w_6 = c_sq(w_3);
  vec2 w_5 = c_mul(w_2, w_3);

  vec2 denom = w_6 + SQRT_5 * w_3 - vec2(1, 0);

  vec3 g = vec3(
    -(3./2.) * c_div(
      c_mul(w, vec2(1, 0) - w_4), 
      denom
    ).y,
    -(3./2.) * c_div(
      c_mul(w, vec2(1, 0) + w_4), 
      denom
    ).x,
    c_div(
      vec2(1, 0) + w_6, 
      denom
    ).y - 0.5
  );

  g = (g / sq(g)).xzy + vec3(0, 0.5, 0);

  // if(ivec2(uv * vec2(size)) == ivec2(size.x-1, 4))
  //   return 0.1 * g;

  // if(ivec2(uv * vec2(size)) == ivec2(size.x-1, 3))
  //   return 0.1 * g;

  // if(ivec2(uv * vec2(size)) == ivec2(size.x-1, 2))
  //   return 0.1 * g;

  // if(ivec2(uv * vec2(size)) == ivec2(size.x-1, 1))
  //   return 0.1 * g;

  // if(ivec2(uv * vec2(size)) == ivec2(size.x-1, 0))
  //   return 0.1 * g;

  return g;
}

vec4 clifford_torus_4d(vec2 uv)
{
  uv -= 0.5;
  uv *= PI * 2.;

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
  uv *= 2. * PI;

  return 0.8 * vec3(vec2(cos(uv.x), sin(uv.x)) * (cos(uv.y) + 2.), sin(uv.y)).xzy;
}

vec3 parametric_surface(vec2 uv)
{
  return boys_surface(uv);
}

const float epsilon = 0.0001;

void main() {
  vec2 uv = vec2(gl_VertexID % size[0], gl_VertexID / size[0]);  // vec2([0, size[0] - 1], [0, size[1] - 1])
  uv /= vec2(size - inclusive);  // If inclusive[d] then uv[d] in [0, 1] else uv[d] in [0, (size[d] - 1) / size[d]]

  position = parametric_surface(uv);
  // normal = normalize(cross(position - parametric_surface(uv + vec2(epsilon, 0)), position - parametric_surface(uv + vec2(0, epsilon))));
}
