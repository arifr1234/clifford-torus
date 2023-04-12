import React from 'react'

import * as twgl from 'twgl.js'
const m4 = twgl.m4;

import _ from 'lodash';

import image_vertex_shader from "../shaders/image_vertex_shader.glsl";
import image_fragment_shader from "../shaders/image_fragment_shader.glsl";
import vertex_generator_vertex_shader from "../shaders/vertex_generator_vertex_shader.glsl";
import dummy_fragment_shader from "../shaders/dummy_fragment_shader.glsl";

const POINTS_SIZE = [50, 50];
const WRAP_AROUND = [true, true];
const INCLUSIVE = [false, false];

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

  draw(gl, program, buffer_info, uniforms, frame_buffer=null)
  {
    twgl.bindFramebufferInfo(gl, frame_buffer);

    gl.useProgram(program.program);

    twgl.setBuffersAndAttributes(gl, program, buffer_info);
    twgl.setUniforms(program, uniforms);
    
    twgl.drawBufferInfo(gl, buffer_info);

    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  transform_feedback_draw(gl, program, buffer_info, uniforms, transform_feedback) {
    gl.useProgram(program.program);

    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transform_feedback);
    gl.beginTransformFeedback(gl.TRIANGLES);

    twgl.setBuffersAndAttributes(gl, program, buffer_info);
    twgl.setUniforms(program, uniforms);
    
    twgl.drawBufferInfo(gl, buffer_info);

    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    gl.disable(gl.RASTERIZER_DISCARD);
  }

  componentDidMount() {
    const gl = this.canvas_ref.current.getContext("webgl2");
    gl.getExtension('EXT_color_buffer_float');

    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.CULL_FACE);  // TODO: gl.CULL_FACE

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    const resolution = [gl.canvas.width, gl.canvas.height];
    console.log(resolution);

    const image = {};
    const vertex_generator = {};

    vertex_generator.program = twgl.createProgramInfo(gl, [vertex_generator_vertex_shader, dummy_fragment_shader], 
      {
        transformFeedbackVaryings: [
          "position",
          "normal",
        ],
      }
    );

    vertex_generator.vertex_buffer = twgl.createBufferInfoFromArrays(gl, {
      position: { numComponents: 3, data: POINTS_SIZE[0] * POINTS_SIZE[1] * 3, drawType: gl.DYNAMIC_DRAW},
      normal: { numComponents: 3, data: POINTS_SIZE[0] * POINTS_SIZE[1] * 3, drawType: gl.DYNAMIC_DRAW},
      indices: { numComponents: 3, data: this.generate_indices()},
    });
    vertex_generator.transform_feedback = twgl.createTransformFeedback(gl, vertex_generator.program, vertex_generator.vertex_buffer);


        // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, vertex_generator.transform_feedback);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
        // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, vertex_generator.transform_feedback);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertex_generator.vertex_buffer.attribs.position.buffer);
        // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertex_generator.vertex_buffer.attribs.normal.buffer);
        // gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);    



    image.program = twgl.createProgramInfo(gl, [image_vertex_shader, image_fragment_shader]);

    this.triangles_buffer_info = twgl.createBufferInfoFromArrays(gl, {
      vertex_index: { numComponents: 1, data: _.range(POINTS_SIZE[0] * POINTS_SIZE[1])},  // TODO: Replace with gl_VertexID
    });

    const render = (time) => {
        const uniforms = {
            time: time * 0.001,
            resolution: resolution,
            size: [POINTS_SIZE[0] - (INCLUSIVE[0] ? 1 : 0), POINTS_SIZE[1] - (INCLUSIVE[1] ? 1 : 0)],
        };

        gl.viewport(0, 0, resolution[0], resolution[1]);

        this.transform_feedback_draw(gl, vertex_generator.program, this.triangles_buffer_info, {rotation_4d: m4.rotateY(m4.identity(), time * 0.001), ...uniforms}, vertex_generator.transform_feedback);
        this.draw(gl, image.program, vertex_generator.vertex_buffer, {...uniforms, ...this.calculate_rotation_matrices(gl, time)});

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  generate_indices() {
    const STEP = 5;
    const full_width = _.range(0, POINTS_SIZE[0] - (WRAP_AROUND[0] ? 0 : 1), 1);
    const steps_width = _.range(0, POINTS_SIZE[0] - (WRAP_AROUND[0] ? 0 : 1), STEP);

    var left_up_corners = _.flatten(
    _.range(POINTS_SIZE[1] - (WRAP_AROUND[1] ? 0 : 1)).map((y) => {
        function x_array(y) {
          if(y % STEP == 0) return full_width;

          return steps_width;
        }

        return x_array(y).map(x => x + y * POINTS_SIZE[0]);
      }
    ));

    var right_up_corners = left_up_corners.map(i => {
      if((i + 1) % POINTS_SIZE[0] == 0) return i + 1 - POINTS_SIZE[0];
      return i + 1
    });

    var left_down_corners = left_up_corners.map(i => i + POINTS_SIZE[0]);

    var indices = _.flatten(_.zip(
      left_up_corners, 
      right_up_corners, 
      left_down_corners,
      right_up_corners, 
      left_down_corners, 
      right_up_corners.map(i => i + POINTS_SIZE[0]),
    ));

    return indices.map(i => i % (POINTS_SIZE[0] * POINTS_SIZE[1]));
  }

  calculate_rotation_matrices(gl, time) {
    const fov = 30 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.5;
    const zFar = 10;
    const projection = m4.perspective(fov, aspect, zNear, zFar);
    const eye = [1, 3, -6];
    const target = [0, 0, 0];
    const up = [0, 1, 0];

    const camera = m4.lookAt(eye, target, up);
    const view = m4.inverse(camera);
    const viewProjection = m4.multiply(projection, view);
    const world = m4.rotationY(0.5 * time * 0.001);

    return {
      u_worldViewProjection: m4.multiply(viewProjection, world),
      u_worldInverseTranspose: m4.transpose(m4.inverse(world)),
    }
  }
}
