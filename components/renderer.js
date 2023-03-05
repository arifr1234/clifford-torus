import React from 'react'

import * as twgl from 'twgl.js'

import _ from 'lodash';

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

    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, this.triangles_buffer_info.numElements, gl.UNSIGNED_SHORT, 0);
  }

  componentDidMount() {
    const gl = this.canvas_ref.current.getContext("webgl2");
    gl.getExtension('EXT_color_buffer_float');

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);

    const m4 = twgl.m4;

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    const resolution = [gl.canvas.width, gl.canvas.height];
    console.log(resolution);

    const image = {};

    image.program = twgl.createProgramInfo(gl, [vertex_shader, fragment_shader], err => {
      throw Error(err);
    });

    const POINTS_SIZE = [40, 40];
    const WRAP_AROUND = [true, true];
    const INCLUSIVE = [false, false];

    var left_up_corners = _.range(POINTS_SIZE[0] - (WRAP_AROUND[0] ? 0 : 1));
    left_up_corners = _.flatten(_.range(POINTS_SIZE[1] - (WRAP_AROUND[1] ? 0 : 1)).map((y) => left_up_corners.map(x => x + y * POINTS_SIZE[0])));

    var coords = _.flatten(_.zip(left_up_corners, left_up_corners.map(i => i + 1), left_up_corners.map(i => i + POINTS_SIZE[0])));

    coords = coords.map(coord => coord % (POINTS_SIZE[0] * POINTS_SIZE[1]));

    coords = _.concat(coords, coords.map(coord => POINTS_SIZE[0] * POINTS_SIZE[1] - 1 - coord));

    this.triangles_buffer_info = twgl.createBufferInfoFromArrays(gl, {
      vertex_index: { numComponents: 1, data: _.range(POINTS_SIZE[0] * POINTS_SIZE[1])},
      indices: { numComponents: 3, data: coords},
    });

    const render = (time) => {
        const uniforms = {
            time: time * 0.001,
            resolution: resolution,
            size: [POINTS_SIZE[0] - (INCLUSIVE[0] ? 1 : 0), POINTS_SIZE[1] - (INCLUSIVE[1] ? 1 : 0)],
            rotation_4d: m4.rotateY(m4.identity(), time * 0.001)
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
        const world = m4.rotationY(0.5 * time * 0.001);
  
        uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);
        uniforms.u_worldInverseTranspose = m4.transpose(m4.inverse(world));


        gl.viewport(0, 0, resolution[0], resolution[1]);
    
        this.draw(gl, image.program, null, uniforms);
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }
}
