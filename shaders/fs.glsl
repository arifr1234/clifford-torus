#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform float time;

in vec3 i_normal;

out vec4 out_color;

#define PI 3.14

void main() {
  vec2 uv = (gl_FragCoord.xy - resolution / 2.) / min(resolution.x, resolution.y);

  vec3 color = vec3(1);

  vec2 abs_uv = abs(uv - 0.3 * vec2(2. * cos(time), sin(2. * time)));
  float t = 3.* time;
  vec4 square = vec4(
    vec3(1, 0, 0), 
    step(max(abs_uv.x, abs_uv.y), 0.2)
  );

  color = mix(color, square.xyz, square.a);

  color = color * (0.5 * dot(i_normal, normalize(vec3(1, 2, 2))) + 0.5);

  out_color = vec4(color, 1.);
}