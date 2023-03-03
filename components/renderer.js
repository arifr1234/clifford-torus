import React from 'react'

import * as twgl from 'twgl.js'

import vertex_shader from "../shaders/vs.glsl";
import fragment_shader from "../shaders/fs.glsl";

export default class Renderer extends React.Component{
  constructor(props) {
    super(props);

    this.canvas_ref = React.createRef();
    this.width = props.width;
    this.height = props.height;
  }

  render() {
    return <canvas ref={this.canvas_ref} style={{width: this.width, height: this.height}}></canvas>
  }

  draw(gl, program, to, uniforms)
  {
    twgl.bindFramebufferInfo(gl, to);

    gl.useProgram(program.program);
    twgl.setBuffersAndAttributes(gl, program, this.triangles_buffer_info);
    twgl.setUniforms(program, uniforms);
    // twgl.drawBufferInfo(gl, this.triangles_buffer_info);
    gl.drawElements(gl.TRIANGLES, this.triangles_buffer_info.numElements, gl.UNSIGNED_SHORT, 0);
  }

  componentDidMount() {
    const gl = this.canvas_ref.current.getContext("webgl2");
    gl.getExtension('EXT_color_buffer_float');

    // gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const m4 = twgl.m4;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    const resolution = [gl.canvas.width, gl.canvas.height];
    console.log(resolution);

    const image = {};

    image.program = twgl.createProgramInfo(gl, [vertex_shader, fragment_shader], err => {
      throw Error(err);
    });

    this.triangles_buffer_info = twgl.createBufferInfoFromArrays(gl, {
      position: [1,1,-1,1,1,1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,-1,-1,-1,-1,-1,1,-1,1,1,1,1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1,1,-1,1,-1,-1,1,1,1,1,-1,1,1,-1,-1,1,1,-1,1,-1,1,-1,1,1,-1,1,-1,-1,-1,-1,-1],
      normal:   [1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1],
      texcoord: [1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1],
      indices:  [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23],
    });

    const render = (time) => {
        const uniforms = {
            time: time * 0.001,
            resolution: resolution,
        };


        const fov = 30 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.5;
        const zFar = 10;
        const projection = m4.perspective(fov, aspect, zNear, zFar);
        const eye = [1, 4, -6];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
  
        const camera = m4.lookAt(eye, target, up);
        const view = m4.inverse(camera);
        const viewProjection = m4.multiply(projection, view);
        const world = m4.rotationY(time * 0.001);
  
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));


        gl.viewport(0, 0, resolution[0], resolution[1]);
    
        this.draw(gl, image.program, null, {...uniforms});
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
}
