import { Nullable } from './types/index';
import { Shader } from './gl/shader';
import { Camera } from './gl/camera';
import { glMatrix, mat4, vec3 } from 'gl-matrix';

export interface IVertices {
    vertices: number[];
    attris: { key: string, size: number, offset: number }[];
    stride: number;
    uniform: { key: string, func: string, data: any }[];
    texture?: {
        url: string;
    }
}
export class Renderer {
    private _gl: WebGL2RenderingContext;
    private _shader: Nullable<Shader> = null;
    public camera: Nullable<Camera> = null;
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
        //TODO:CAMERA
        const position = vec3.create();
        const direction = vec3.create();
        const up = vec3.create();
        this.camera = new Camera(vec3.set(position, 0, 0, 0), vec3.set(direction, 0, 0, -1), vec3.set(up, 0, 1, 0));
        this.camera.perspective(glMatrix.toRadian(45), this._gl.canvas.width / this._gl.canvas.height, 10, 1000);
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

        if (data.texture && data.texture.url) {
            const texture = this._gl.createTexture();
            this._gl.activeTexture(this._gl.TEXTURE0 + 0);
            let img = new Image();
            img.src = data.texture.url;
            img.addEventListener("load", () => {
                this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.REPEAT);
                this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_WRAP_T, this._gl.REPEAT);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, img.width, img.height, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE,img)
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
            })
        }

        this.draw(data);
    } 

    draw(data: IVertices) {
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const program = this._shader?.program as WebGLProgram;
        let matrixLocation = this._gl.getUniformLocation(program, "u_matrix");
        this._shader?.use();
        this._gl.uniformMatrix3fv(matrixLocation, false, mat4.multiply(this.camera?.projection,this.camera?.lookAt));
        this._gl.drawArrays(this._gl.TRIANGLES, 0, data.vertices.length / data.stride);
        requestAnimationFrame(this.draw.bind(this, data));
    }
}