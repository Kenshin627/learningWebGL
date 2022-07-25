import { Nullable } from './types/index';
import { Shader } from './gl/shader';
import { Camera } from './gl/camera';
import { glMatrix, mat4, vec3 } from 'gl-matrix';
import { Light } from './gl/light';
import { Geometry } from './gl/geometry';
import { Mesh } from './gl/mesh';

export interface cameraOptions {
    position: n3<number>,
    direction: n3<number>,
    up: n3<number>
}

export type n3<T> = [T, T, T]
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

    async compiler(mesh: Mesh, camera?: cameraOptions) {
        const { geometry, shader: meshshader, material } = mesh;
        //TODO:DISPSOE
        if (this._currentRAF) {
            cancelAnimationFrame(this._currentRAF);
            this._currentRAF = null;
        }

        //TODO: LIGHT
        this.light = new Light(vec3.fromValues(1.0, 1.0, 1.0), vec3.normalize(vec3.create(), vec3.fromValues(-.5, -.7, -1.0)), .5, .1)
        
        //TODO:CAMERA
        this.camera = new Camera(vec3.fromValues(0, 0, -200), vec3.fromValues(0, 0, -1), vec3.fromValues(0, 1, 0));
        if (camera) {
            const { position, direction, up } = camera;
            this.camera = new Camera(vec3.fromValues(...position), vec3.fromValues(...direction), vec3.fromValues(...up));
        }
        this.camera.perspective(glMatrix.toRadian(60), this._gl.canvas.width / this._gl.canvas.height, 1, 1000);
        //TODO:PROGRA
        const shader = this._shader = new Shader(this._gl);
        await shader.readShader(meshshader);
        shader.compilerShader();
        const program = shader.program as WebGLProgram;
        let vao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);
        let buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), this._gl.STATIC_DRAW);

        geometry.attris.forEach(attr =>{
            const itemLocation = this._gl.getAttribLocation(program, attr.key);
            this._gl.enableVertexAttribArray(itemLocation);
            this._gl.vertexAttribPointer(itemLocation, attr.size, this._gl.FLOAT, false, geometry.stride *4 , attr.offset * 4)
        })

        if (material.textures && material.textures.length) {
            const texture = this._gl.createTexture();
            this._gl.activeTexture(this._gl.TEXTURE0 + 0);
            let img = new Image();
            img.src = material.textures[0];
            img.addEventListener("load", () => {
                this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.REPEAT);
                this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_WRAP_T, this._gl.REPEAT);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, img.width, img.height, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE,img)
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
            })
        }
        this._currentRAF = requestAnimationFrame(this.draw.bind(this, geometry, 0));
    } 

    draw(data: Geometry, rotationRadian: number) {
        rotationRadian += (glMatrix.toRadian(15)) / 60;
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        this._gl.enable(this._gl.DEPTH_TEST);
        // this._gl.frontFace(this._gl.CCW)
        // this._gl.enable(this._gl.CULL_FACE);

        //TODO:SETUNIFORMS

        //Varibles
        let rotationMatrix = mat4.create();
        let normalMatrix = mat4.create();
        
        mat4.fromYRotation(rotationMatrix, rotationRadian);
        mat4.transpose(normalMatrix, mat4.invert(normalMatrix,rotationMatrix));

        this._shader?.use();

        this._shader?.setMatrix4x4("u_model", rotationMatrix);
        this._shader?.setMatrix4x4("u_timodel", normalMatrix);
        this._shader?.setMatrix4x4("u_view", this.camera?.lookAt as mat4);
        this._shader?.setMatrix4x4("u_projection", this.camera?.projection as mat4);
        this._shader?.setVec3("u_lightDir", this.light?.direction as vec3);
        this._shader?.setVec3("u_lightColor", this.light?.color as vec3);
        this._shader?.setFloat("u_lightIntensity", this.light?.intensity as number);
        this._shader?.setFloat("u_ambient", this.light?.ambient as number);
        this._shader?.setVec3("view_position", this.camera?.position as vec3);

        this._gl.drawArrays(this._gl.TRIANGLES, 0, data.vertices.length / data.stride);

        this._currentRAF = requestAnimationFrame(this.draw.bind(this, data, rotationRadian));
    }
}