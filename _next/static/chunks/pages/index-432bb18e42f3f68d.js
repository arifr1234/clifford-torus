(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{845:function(n,r,e){"use strict";e.r(r),e.d(r,{default:function(){return A}});var o=e(9008),t=e.n(o);e(5675);var i=e(214),c=e.n(i),s=e(9499),a=e(2777),u=e(2262),v=e(5959),_=e(2179),l=e(7247),m=e(7294),p=e(8460),f=e(6486),d=e.n(f),h=e(5893);function g(n,r){var e=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(n,r).enumerable})),e.push.apply(e,o)}return e}function b(n){for(var r=1;r<arguments.length;r++){var e=null!=arguments[r]?arguments[r]:{};r%2?g(Object(e),!0).forEach(function(r){(0,s.Z)(n,r,e[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(e)):g(Object(e)).forEach(function(r){Object.defineProperty(n,r,Object.getOwnPropertyDescriptor(e,r))})}return n}var w=p.m4,x=[500,50],y=[!1,!1],z=[!0,!0],T=function(n){(0,v.Z)(t,n);var r,e,o=(e=function(){if("undefined"==typeof Reflect||!Reflect.construct||Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(n){return!1}}(),function(){var n,r=(0,l.Z)(t);if(e){var o=(0,l.Z)(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return(0,_.Z)(this,n)});function t(n){var r;return(0,a.Z)(this,t),(r=o.call(this,n)).canvas_ref=m.createRef(),r.width=n.width,r.height=n.height,r}return(0,u.Z)(t,[{key:"render",value:function(){return(0,h.jsx)("canvas",{ref:this.canvas_ref,style:{width:this.width,height:this.height,backgroundColor:"black"}})}},{key:"draw",value:function(n,r,e,o){var t=arguments.length>4&&void 0!==arguments[4]?arguments[4]:null;p.GG(n,t),n.useProgram(r.program),p.o8(n,r,e),p.N9(r,o),p.y0(n,e,n.TRIANGLES)}},{key:"transform_feedback_draw",value:function(n,r,e,o,t,i){n.useProgram(r.program),n.enable(n.RASTERIZER_DISCARD),n.bindTransformFeedback(n.TRANSFORM_FEEDBACK,i),n.beginTransformFeedback(n.TRIANGLES),p.N9(r,t),n.drawArrays(n.TRIANGLES,e,o),n.endTransformFeedback(),n.bindTransformFeedback(n.TRANSFORM_FEEDBACK,null),n.disable(n.RASTERIZER_DISCARD)}},{key:"componentDidMount",value:function(){var n=this,r=this.canvas_ref.current.getContext("webgl2");r.getExtension("EXT_color_buffer_float"),r.enable(r.DEPTH_TEST),p.Lo(r.canvas);var e=[r.canvas.width,r.canvas.height];console.log(e);var o={},t={};t.program=p.EK(r,["#version 300 es\r\n\r\nuniform mat4 rotation_4d;\r\n\r\nuniform ivec2 size;\r\nuniform ivec2 inclusive;\r\nuniform float time;\r\n\r\nout vec3 position;\r\n// out vec3 normal;\r\n\r\n#define PI 3.14159265359\r\n\r\n#define sq(x) dot(x, x)\r\n#define cis(x) vec2(cos(x), sin(x))\r\n\r\nvec2 c_mul(vec2 a, vec2 b) { return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x); }\r\nvec2 c_sq(vec2 z) { return vec2(sq(z.x) - sq(z.y), 2. * z.x * z.y); }\r\n#define c_conjugate(z) (z * vec2(1, -1))\r\nvec2 c_div(vec2 a, vec2 b) { return c_mul(a, c_conjugate(b)) / sq(b); }\r\n\r\nconst float SQRT_5 = sqrt(5.);\r\n\r\nvec3 boys_surface(vec2 uv)\r\n{\r\n  float t = time / 5.;\r\n  int stage = int(floor(t)) % 4;\r\n\r\n  t = mod(t, 1.);\r\n\r\n  vec2 min_point;\r\n  vec2 max_point;\r\n\r\n  const float width = 0.15;\r\n  vec2 uv_size;\r\n  vec2 start;\r\n\r\n  switch (stage) {\r\n  case 0:\r\n      min_point = vec2(0, 0.0001 + (1. - width) * smoothstep(0.5, 1., t));\r\n      max_point = vec2(1, smoothstep(0., 0.5, t));\r\n      break;\r\n  case 1:\r\n      uv_size = vec2(1. - smoothstep(0., 1., t), width);\r\n      start = vec2(0, (1. - width));\r\n\r\n      min_point = start;\r\n      max_point = start + uv_size;\r\n      break;\r\n  case 2:\r\n      min_point = vec2(0, (1. - smoothstep(0.3, 1., t)) * (1. - width));;\r\n      max_point = vec2(smoothstep(0., 1., t), 1.);;\r\n      break;\r\n  case 3:\r\n      uv_size = vec2((1. - smoothstep(0., 1., t)), 1. - smoothstep(0., 1., t));\r\n      start = vec2(0, 0.7 * smoothstep(0., 1., t));\r\n\r\n      min_point = start;\r\n      max_point = start + uv_size;\r\n      break;\r\n  }\r\n\r\n  vec2 normalized_uv = mix(min_point, max_point, uv);\r\n\r\n  normalized_uv *= vec2(2. * PI, 1);\r\n  vec2 w = normalized_uv.y * cis(normalized_uv.x);\r\n\r\n  vec2 w_2 = c_sq(w);\r\n  vec2 w_4 = c_sq(w_2);\r\n  vec2 w_3 = c_mul(w_2, w);\r\n  vec2 w_6 = c_sq(w_3);\r\n  vec2 w_5 = c_mul(w_2, w_3);\r\n\r\n  vec2 denom = w_6 + SQRT_5 * w_3 - vec2(1, 0);\r\n\r\n  vec3 g = vec3(\r\n    -(3./2.) * c_div(\r\n      c_mul(w, vec2(1, 0) - w_4), \r\n      denom\r\n    ).y,\r\n    -(3./2.) * c_div(\r\n      c_mul(w, vec2(1, 0) + w_4), \r\n      denom\r\n    ).x,\r\n    c_div(\r\n      vec2(1, 0) + w_6, \r\n      denom\r\n    ).y - 0.5\r\n  );\r\n\r\n  g = (g / sq(g)).xzy + vec3(0, 0.5, 0);\r\n\r\n  return g;\r\n}\r\n\r\nvec4 clifford_torus_4d(vec2 uv)\r\n{\r\n  uv -= 0.5;\r\n  uv *= PI * 2.;\r\n\r\n  return vec4(cos(uv.x), sin(uv.x), cos(uv.y), sin(uv.y));\r\n}\r\n\r\nvec3 stereographic_projection(vec4 pos_4d)\r\n{\r\n  return pos_4d.yzw / (1. - min(1.01 * pos_4d.x, 1.));\r\n}\r\n\r\nvec3 clifford_torus_3d(vec2 uv)\r\n{\r\n  return stereographic_projection(rotation_4d * clifford_torus_4d(uv));\r\n}\r\n\r\nvec3 torus(vec2 uv)\r\n{\r\n  uv *= 2. * PI;\r\n\r\n  return 0.8 * vec3(vec2(cos(uv.x), sin(uv.x)) * (cos(uv.y) + 2.), sin(uv.y)).xzy;\r\n}\r\n\r\nvec3 parametric_surface(vec2 uv)\r\n{\r\n  return boys_surface(uv);\r\n}\r\n\r\nconst float epsilon = 0.0001;\r\n\r\nvoid main() {\r\n  vec2 uv = vec2(gl_VertexID % size[0], gl_VertexID / size[0]);  // vec2([0, size[0] - 1], [0, size[1] - 1])\r\n  uv /= vec2(size - inclusive);  // If inclusive[d] then uv[d] in [0, 1] else uv[d] in [0, (size[d] - 1) / size[d]]\r\n\r\n  position = parametric_surface(uv);\r\n  // normal = normalize(cross(position - parametric_surface(uv + vec2(epsilon, 0)), position - parametric_surface(uv + vec2(0, epsilon))));\r\n}\r\n","#version 300 es\r\nprecision highp float;\r\n\r\nvoid main() { }\r\n"],{transformFeedbackVaryings:["position",]});var i=x[0]*(x[1]+1+1),c=1*x[0];t.vertex_buffer=p.qX(r,{position:{numComponents:3,data:3*i,offset:12*c,type:r.FLOAT,drawType:r.DYNAMIC_DRAW},normal:{numComponents:3,data:3*i,offset:12*c,type:r.FLOAT,drawType:r.DYNAMIC_DRAW}}),t.vertex_buffer.attribs.position.size=12*i,t.transform_feedback=p.f3(r,t.program,t.vertex_buffer);var s=t.vertex_buffer.attribs.position.buffer,a=p.qX(r,{position:{numComponents:3,buffer:s,stride:12,offset:12*c},position_right:{numComponents:3,buffer:s,stride:12,offset:(c+1)*12},position_down:{numComponents:3,buffer:s,stride:12,offset:(c+x[0])*12},position_left:{numComponents:3,buffer:s,stride:12,offset:(c-1)*12},position_up:{numComponents:3,buffer:s,stride:12,offset:(c-x[0])*12},normal:t.vertex_buffer.attribs.normal,indices:{numComponents:3,data:this.generate_indices()}}),u=p.qX(r,{position:{numComponents:1,data:1,type:r.FLOAT},position_right:{numComponents:1,data:1,type:r.FLOAT},position_down:{numComponents:1,data:1,type:r.FLOAT},position_left:{numComponents:1,data:1,type:r.FLOAT},position_up:{numComponents:1,data:1,type:r.FLOAT}});o.program=p.EK(r,["#version 300 es\r\n\r\nuniform mat4 u_worldViewProjection;\r\nuniform mat4 u_worldInverseTranspose;\r\n\r\nuniform ivec2 size;\r\n\r\nin vec3 position;\r\n// in vec3 normal;\r\nin vec3 position_right;\r\nin vec3 position_down;\r\nin vec3 position_left;\r\nin vec3 position_up;\r\n\r\nout vec3 i_normal;\r\nout vec4 i_color;\r\n\r\n#define sq(x) dot(x, x)\r\n\r\nvoid main() {\r\n  gl_Position = u_worldViewProjection * vec4(position, 1) / vec4(1, 1, 100, 1);\r\n\r\n  vec2 uv = vec2(gl_VertexID % size.x, gl_VertexID / size.x) / vec2(size - 1);\r\n\r\n  vec3 normal = normalize(\r\n    (1. - uv.y) * (1. - uv.x) * cross(position - position_right, position - position_down) +\r\n    (1. - uv.y) * uv.x        * cross(position - position_down, position - position_left) +\r\n    uv.y * uv.x               * cross(position - position_left, position - position_up) +\r\n    uv.y * (1. - uv.x)        * cross(position - position_up, position - position_right)\r\n  );\r\n\r\n  i_normal = (u_worldInverseTranspose * vec4(normal, 1)).xyz;\r\n\r\n  i_color = vec4(0.3 * vec3(1., 1., 1.), 1.);  // step(sq(position), sq(100.))\r\n}\r\n","#version 300 es\r\nprecision mediump float;\r\n\r\nuniform vec2 resolution;\r\nuniform float time;\r\n\r\nin vec3 i_normal;\r\nin vec4 i_color;\r\n\r\nout vec4 out_color;\r\n\r\nconst float ambiant_color = 0.3;\r\n\r\nstruct Light\r\n{\r\n  vec3 dir;\r\n  vec3 color;\r\n};\r\n\r\nconst Light lights[] = Light[](\r\n  // Light(normalize(vec3(-2, 1, 2)), vec3(0, 1, 1)),\r\n  Light(normalize(vec3(-2, 1, 2)), vec3(1, 0, 1)),\r\n  Light(normalize(vec3(1, -2, 2)), vec3(1, 1, 0))\r\n);\r\n\r\n\r\nvoid main() {\r\n  vec2 uv = (gl_FragCoord.xy - resolution / 2.) / min(resolution.x, resolution.y);\r\n\r\n  vec3 color = i_color.rgb;\r\n\r\n  \r\n  for(int i = 0; i < lights.length(); i += 1) {\r\n    Light light = lights[i];\r\n    vec3 normal = gl_FrontFacing ? i_normal : -i_normal;\r\n    color = mix(color, light.color, (1. - ambiant_color) * pow(0.5 * dot(normal, light.dir) + 0.5, 1.));\r\n    // color = mix(color, light.color, step(0.8, 0.5 * dot(normal, light.dir) + 0.5));\r\n  }\r\n\r\n  // if(i_color.a < 1.)\r\n  // {\r\n  //   discard;\r\n  //   return;\r\n  // }\r\n\r\n  out_color = vec4(color, 1);\r\n}"]);var v=0,_=function i(c){var s={time:.001*c,resolution:e,size:x,inclusive:[Number(z[0]),Number(z[1])]};r.viewport(0,0,e[0],e[1]),n.transform_feedback_draw(r,t.program,0,x[0]*x[1]+2,b({rotation_4d:w.rotateY(w.identity(),.001*c)},s),t.transform_feedback),n.draw(r,o.program,a,b(b({},s),n.calculate_rotation_matrices(r,c))),p.o8(r,o.program,u),v+=1,requestAnimationFrame(i)};requestAnimationFrame(_)}},{key:"generate_indices",value:function(){var n=d().range(0,x[0]-(y[0]?0:1),1),r=d().range(0,x[0]-(y[0]?0:1),1),e=d().flatten(d().range(x[1]-(y[1]?0:1)).map(function(e){var o;return(e%1==0?n:r).map(function(n){return n+e*x[0]})})),o=e.map(function(n){return(n+1)%x[0]==0?n+1-x[0]:n+1}),t=e.map(function(n){return n+x[0]});return d().flatten(d().zip(e,o,t,o,o.map(function(n){return n+x[0]}),t)).map(function(n){return n%(x[0]*x[1])})}},{key:"calculate_rotation_matrices",value:function(n,r){var e=n.canvas.clientWidth/n.canvas.clientHeight,o=w.perspective(30*Math.PI/180,e,.5,10),t=w.lookAt([1,3,-6],[0,0,0],[0,1,0]),i=w.inverse(t),c=w.multiply(o,i),s=w.rotationY(.5*r*.001);return{u_worldViewProjection:w.multiply(c,s),u_worldInverseTranspose:w.transpose(w.inverse(s))}}}]),t}(m.Component);function A(){return(0,h.jsxs)("div",{className:c().container,children:[(0,h.jsxs)(t(),{children:[(0,h.jsx)("title",{children:"TITLE"}),(0,h.jsx)("meta",{name:"description",content:"description"}),(0,h.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,h.jsxs)("main",{className:c().main,children:[(0,h.jsx)("h1",{className:c().title,children:"AAAAA"}),(0,h.jsx)(T,{width:"100%",height:"100%"})]})]})}},5557:function(n,r,e){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return e(845)}])},214:function(n){n.exports={container:"Home_container__bCOhY",main:"Home_main__nLjiQ",footer:"Home_footer____T7K",title:"Home_title__T09hD",description:"Home_description__41Owk",code:"Home_code__suPER",grid:"Home_grid__GxQ85",card:"Home_card___LpL1",logo:"Home_logo__27_tb"}}},function(n){n.O(0,[829,662,195,774,888,179],function(){return n(n.s=5557)}),_N_E=n.O()}]);