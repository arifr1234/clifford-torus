#version 300 es
precision mediump float;

uniform vec2 resolution;
uniform float time;

in vec3 i_normal;
in vec4 i_color;

out vec4 out_color;

#define PI 3.14

const float ambiant_color = 0.3;

struct Light
{
  vec3 dir;
  vec3 color;
};

const Light lights[] = Light[](
  Light(normalize(vec3(1, 2, 2)), vec3(0, 1, 1)),
  Light(normalize(vec3(-1, -2, -2)), vec3(1, 0, 1))
);


void main() {
  vec2 uv = (gl_FragCoord.xy - resolution / 2.) / min(resolution.x, resolution.y);

  vec3 color = i_color.rgb;

  
  for(int i = 0; i < lights.length(); i += 1) {
    Light light = lights[i];
    color = mix(color, light.color, (1. - ambiant_color) * pow(0.5 * dot(i_normal, light.dir) + 0.5, 1.));
    // color = mix(color, light.color, step(0.8, 0.5 * dot(i_normal, light.dir) + 0.5));
  }

  // if(i_color.a < 1.)
  // {
  //   discard;
  //   return;
  // }

  out_color = vec4(color, 1);
}