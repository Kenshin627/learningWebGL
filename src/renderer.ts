import { Nullable } from './types/index';
import { Shader } from './gl/shader';
export interface IVertices {
    vertices: number[];
    attris: { key: string, size: number, offset: number }[];
    stride: number;
    uniform: { key: string, func: string, data: any }[];
}
export class Renderer {
    private _gl: WebGL2RenderingContext;
    private _shader: Nullable<Shader> = null;
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

    async compiler(shaderPath: string, data: IVertices) {

        //TODO:PROGRAM
        const shader = this._shader = new Shader(this._gl);
        await shader.readShader(shaderPath);
        shader.compilerShader();
        const program = shader.program as WebGLProgram;
        let vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);
        let buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(data.vertices), this._gl.STATIC_DRAW);

        data.attris.forEach(attr =>{
            const itemLocation = this._gl.getAttribLocation(program, attr.key);
            this._gl.enableVertexAttribArray(itemLocation);
            this._gl.vertexAttribPointer(itemLocation, attr.size, this._gl.FLOAT, false, data.stride *4 , attr.offset * 4)
        })

        this.draw(data);
    } 

    draw(data: IVertices) {
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const program = this._shader?.program as WebGLProgram;
        let matrixLocation = this._gl.getUniformLocation(program, "u_matrix");
        this._shader?.use();
        this._gl.uniformMatrix3fv(matrixLocation, false, this.projection(this._gl.canvas.width, this._gl.canvas.height));
        this._gl.drawArrays(this._gl.TRIANGLES, 0, data.vertices.length / data.stride);
        requestAnimationFrame(this.draw.bind(this, data));
    }

    projection(width: number, height: number) {
        return [
            2/width, 0, 0,
            0, 2/height, 0,
            0, 0, 0
        ]
    }

}