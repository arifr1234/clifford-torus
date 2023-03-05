#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform float time;

in vec3 i_normal;
in vec4 i_color;

out vec4 out_color;

#define PI 3.14

void main() {
  vec2 uv = (gl_FragCoord.xy - resolution / 2.) / min(resolution.x, resolution.y);

  vec3 color = i_color.rgb;

  color = color * (0.5 * dot(i_normal, normalize(vec3(1, 2, 2))) + 0.5);

  if(i_color.a < 1.)
  {
    discard;
    return;
  }

  out_color = vec4(color, 1);
}