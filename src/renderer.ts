import { Program } from "./gl/program";
import { ShaderFactory } from "./gl/shader";
import { Nullable } from './types/index';
export class Renderer {
    private _gl: WebGL2RenderingContext;
    private _curProgram: Nullable<WebGLProgram> = null;
    constructor(el: HTMLCanvasElement) {
        let glOpts: WebGLContextAttributes = {
            alpha: true,
            antialias: true,
            depth: true,
            stencil: true
        };
        const _gl = el.getContext("webgl2", glOpts);
        if (_gl) {
            this._gl = _gl;
        }else {
            throw new Error("无法创建webglContext对象");
        }
    }

    compilerShader() {
        var vertexShaderSource = `#version 300 es
            in vec2 a_position;
            out vec4 v_color;
            uniform mat3 u_matrix;
            void main() {
                gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0, 1.0);
                v_color = gl_Position * 0.5 + 0.5;
            }
        `;
        
        var fragmentShaderSource = `#version 300 es
            precision highp float;
            in vec4 v_color;
            out vec4 outColor;
            
            void main() {
                outColor = vec4(v_color.xy, 1.0, 1.0);
            }
        `;

        //TODO:PROGRAM
        this._curProgram = Program.create(
            this._gl, 
            ShaderFactory.createShader(
                this._gl, 
                this._gl.VERTEX_SHADER, 
                vertexShaderSource
            ), 
            ShaderFactory.createShader(
                this._gl, 
                this._gl.FRAGMENT_SHADER, 
                fragmentShaderSource
            )
        );

        let positionLocation = this._gl.getAttribLocation(this._curProgram, "a_position");
        let vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        let buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array([
            -200, -130,
            0, 65,
            200, -130
        ]), this._gl.STATIC_DRAW);

        this._gl.enableVertexAttribArray(positionLocation);
        this._gl.vertexAttribPointer(positionLocation, 2, this._gl.FLOAT, false, 0, 0);
        this.draw();
    }

    draw() {
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        let matrixLocation = this._gl.getUniformLocation(this._curProgram as WebGLProgram, "u_matrix");
        this._gl.useProgram(this._curProgram);
        this._gl.uniformMatrix3fv(matrixLocation, false, this.projection(this._gl.canvas.width, this._gl.canvas.height));
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 3);
    }

    projection(width: number, height: number) {
        return [
            2/width, 0, 0,
            0, 2/height, 0,
            0, 0, 0
        ]
    }

}