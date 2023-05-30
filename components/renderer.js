import React from 'react'

import * as twgl from 'twgl.js'
const m4 = twgl.m4;

import _ from 'lodash';

import image_vertex_shader from "../shaders/image_vertex_shader.glsl";
import image_fragment_shader from "../shaders/image_fragment_shader.glsl";
import vertex_generator_vertex_shader from "../shaders/vertex_generator_vertex_shader.glsl";
import dummy_fragment_shader from "../shaders/dummy_fragment_shader.glsl";

const POINTS_SIZE = [250, 25];
const WRAP_AROUND = [false, false];
const INCLUSIVE = [true, true];

export default class Renderer extends React.Component{
  constructor(props) {
    super(props);

    this.canvas_ref = React.createRef();
    this.width = props.width;
    this.height = props.height;
  }

  render() {
    return <canvas ref={this.canvas_ref} style={{width: this.width, height: this.height, backgroundColor: "black"}}></canvas>
  }

  draw(gl, program, buffer_info, uniforms, frame_buffer=null)
  {
    twgl.bindFramebufferInfo(gl, frame_buffer);

    gl.useProgram(program.program);

    twgl.setBuffersAndAttributes(gl, program, buffer_info);
    twgl.setUniforms(program, uniforms);
    
    twgl.drawBufferInfo(gl, buffer_info, gl.TRIANGLES);
  }

  transform_feedback_draw(gl, program, first, count, uniforms, transform_feedback) {
    gl.useProgram(program.program);

    gl.enable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, transform_feedback);
    gl.beginTransformFeedback(gl.TRIANGLES);

    twgl.setUniforms(program, uniforms);
    
    gl.drawArrays(gl.TRIANGLES, first, count);

    gl.endTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    gl.disable(gl.RASTERIZER_DISCARD);
  }

  componentDidMount() {
    const gl = this.canvas_ref.current.getContext("webgl2");
    gl.getExtension('EXT_color_buffer_float');

    gl.enable(gl.DEPTH_TEST);

    twgl.resizeCanvasToDisplaySize(gl.canvas);
    const resolution = [gl.canvas.width, gl.canvas.height];
    console.log(resolution);

    const image = {};
    const vertex_generator = {};

    vertex_generator.program = twgl.createProgramInfo(gl, [vertex_generator_vertex_shader, dummy_fragment_shader], 
      {
        transformFeedbackVaryings: [
          "position",
          // "normal",
        ],
      }
    );

    const BYTES_IN_FLOAT = 4;
    const BYTES_IN_VEC3 = BYTES_IN_FLOAT * 3;

    const VERTEX_START_EXTRA_ROWS = 1;
    const VERTEX_END_EXTRA_ROWS = 1;

    const VERTEX_BUFFER_LENGTH = POINTS_SIZE[0] * (POINTS_SIZE[1] + VERTEX_START_EXTRA_ROWS + VERTEX_END_EXTRA_ROWS);
    const VERTEX_BUFFER_OFFSET = POINTS_SIZE[0] * VERTEX_START_EXTRA_ROWS;

    vertex_generator.vertex_buffer = twgl.createBufferInfoFromArrays(gl, {
      position: { 
        numComponents: 3, 
        data: VERTEX_BUFFER_LENGTH * 3, 
        offset: VERTEX_BUFFER_OFFSET * BYTES_IN_VEC3, 
        type: gl.FLOAT,
        drawType: gl.DYNAMIC_DRAW
      },
      normal: { 
        numComponents: 3, 
        data: VERTEX_BUFFER_LENGTH * 3, 
        offset: VERTEX_BUFFER_OFFSET * BYTES_IN_VEC3, 
        type: gl.FLOAT, 
        drawType: gl.DYNAMIC_DRAW
      },
    });

    vertex_generator.vertex_buffer.attribs.position.size = VERTEX_BUFFER_LENGTH * BYTES_IN_VEC3;  // Configuring size this way because of a bug in twgl.createTransformFeedback: https://github.com/greggman/twgl.js/issues/222

    vertex_generator.transform_feedback = twgl.createTransformFeedback(gl, vertex_generator.program, vertex_generator.vertex_buffer);

    const vertex_positions = vertex_generator.vertex_buffer.attribs.position.buffer;

    const neighboring_vertex_buffer_info = twgl.createBufferInfoFromArrays(gl, {
      position: {numComponents: 3, buffer: vertex_positions, stride: BYTES_IN_VEC3, offset: VERTEX_BUFFER_OFFSET * BYTES_IN_VEC3},
      position_right: {numComponents: 3, buffer: vertex_positions, stride: BYTES_IN_VEC3, offset: (VERTEX_BUFFER_OFFSET + 1) * BYTES_IN_VEC3},
      position_down: {numComponents: 3, buffer: vertex_positions, stride: BYTES_IN_VEC3, offset: (VERTEX_BUFFER_OFFSET + POINTS_SIZE[0]) * BYTES_IN_VEC3},
      position_left: {numComponents: 3, buffer: vertex_positions, stride: BYTES_IN_VEC3, offset: (VERTEX_BUFFER_OFFSET - 1) * BYTES_IN_VEC3},
      position_up: {numComponents: 3, buffer: vertex_positions, stride: BYTES_IN_VEC3, offset: (VERTEX_BUFFER_OFFSET - POINTS_SIZE[0]) * BYTES_IN_VEC3},
      normal: vertex_generator.vertex_buffer.attribs.normal,
      indices: { numComponents: 3, data: this.generate_indices()},
    });

    const dummy_vertex_buffer_info = twgl.createBufferInfoFromArrays(gl, {
      position: {numComponents: 1, data: 1, type: gl.FLOAT},
      position_right: {numComponents: 1, data: 1, type: gl.FLOAT},
      position_down: {numComponents: 1, data: 1, type: gl.FLOAT},
      position_left: {numComponents: 1, data: 1, type: gl.FLOAT},
      position_up: {numComponents: 1, data: 1, type: gl.FLOAT},
    });

    image.program = twgl.createProgramInfo(gl, [image_vertex_shader, image_fragment_shader]);

    var frame = 0;
        
    const render = (time) => {
        const uniforms = {
            time: time * 0.001,
            resolution: resolution,
            size: POINTS_SIZE,
            inclusive: [Number(INCLUSIVE[0]), Number(INCLUSIVE[1])],
        };

        gl.viewport(0, 0, resolution[0], resolution[1]);
    
        this.transform_feedback_draw(
          gl, 
          vertex_generator.program, 
          0,  // TODO: Understand why not VERTEX_BUFFER_OFFSET?
          POINTS_SIZE[0] * POINTS_SIZE[1] + 2,  // TODO: remove the +2.
          {rotation_4d: m4.rotateY(m4.identity(), time * 0.001), ...uniforms}, 
          vertex_generator.transform_feedback,
        );
        this.draw(
          gl, 
          image.program, 
          neighboring_vertex_buffer_info, 
          {...uniforms, ...this.calculate_rotation_matrices(gl, time)}
        );
        
        twgl.setBuffersAndAttributes(gl, image.program, dummy_vertex_buffer_info);  
        /*
        Enables the next transform feedback draw call to write into buffers that were bound by the regular draw call using gl.vertexAttribPointer, 
        by calling gl.vertexAttribPointer again with dummy buffers.
        */

        frame += 1;
        
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  generate_indices() {
    const STEP = 1;
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
      right_up_corners.map(i => i + POINTS_SIZE[0]),
      left_down_corners, 
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
