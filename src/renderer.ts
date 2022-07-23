import { Nullable } from './types/index';
import { Shader } from './gl/shader';
import { Camera } from './gl/camera';
import { glMatrix, mat4, vec3 } from 'gl-matrix';
import { Light } from './gl/light';

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
    private _currentRAF: Nullable<number> = null;
    public camera: Nullable<Camera> = null;
    public light: Nullable<Light> = null;
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
        //TODO:DISPSOE
        if (this._currentRAF) {
            cancelAnimationFrame(this._currentRAF);
            this._currentRAF = null;
        }

        //TODO: LIGHT
        this.light = new Light(vec3.fromValues(1.0, 1.0, 1.0), vec3.normalize(vec3.create(), vec3.fromValues(.5, .7, 1.0)), .7, .1)
        
        //TODO:CAMERA
        const position = vec3.create();
        const direction = vec3.create();
        const up = vec3.create();
        vec3.set(position, 100, 100, -200);
        vec3.set(direction, 0, 0, -1);
        vec3.set(up, 0, 1, 0);
        this.camera = new Camera(position, direction, up);
        this.camera.perspective(glMatrix.toRadian(60), this._gl.canvas.width / this._gl.canvas.height, 1, 1000);
        //TODO:PROGRA
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
        this._currentRAF = requestAnimationFrame(this.draw.bind(this, data, 0));
    } 

    draw(data: IVertices, rotationRadian: number) {

        rotationRadian += (glMatrix.toRadian(15)) / 60;
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        const program = this._shader?.program as WebGLProgram;
        this._gl.enable(this._gl.DEPTH_TEST);
        // this._gl.enable(this._gl.CULL_FACE);
        let modelLocation = this._gl.getUniformLocation(program, "u_model");
        let timodelLocation = this._gl.getUniformLocation(program, "u_timodel");
        let matrixLocation = this._gl.getUniformLocation(program, "u_viewprojection");
        let lightDir = this._gl.getUniformLocation(program, "u_lightDir");
        let lightColor = this._gl.getUniformLocation(program, "u_lightColor")
        let lightIntensity = this._gl.getUniformLocation(program, "u_lightIntensity");
        let ambient = this._gl.getUniformLocation(program, "u_ambient");
        this._shader?.use();
        let viewProjection = mat4.create();
        let rotationMatrix = mat4.create();
        let tranposeinvertModel = mat4.create();
        mat4.fromYRotation(rotationMatrix, rotationRadian);
        mat4.multiply(viewProjection, this.camera?.projection as mat4, this.camera?.lookAt as mat4);
        this._gl.uniformMatrix4fv(modelLocation, false, rotationMatrix);
        this._gl.uniformMatrix4fv(timodelLocation, false, mat4.transpose(tranposeinvertModel, mat4.invert(tranposeinvertModel,rotationMatrix)));
        this._gl.uniformMatrix4fv(matrixLocation, false, viewProjection);
        this._gl.uniform3f(lightDir, this.light?.direction[0] as number, this.light?.direction[1] as number, this.light?.direction[2] as number);
        this._gl.uniform3f(lightColor, this.light?.color[0] as number, this.light?.color[1] as number, this.light?.color[2] as number);
        this._gl.uniform1f(lightIntensity, this.light?.intensity as number);
        this._gl.uniform1f(ambient, this.light?.ambient as number);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, data.vertices.length / data.stride);
        this._currentRAF = requestAnimationFrame(this.draw.bind(this, data, rotationRadian));
    }
}