import { Nullable } from './types/index';
import { Shader } from './gl/shader';
import { Camera, cameraOptions } from './gl/camera';
import { glMatrix, mat4, vec3, vec4 } from 'gl-matrix';
import { DirectionLight } from './light/directionLight';
import { Geometry } from './gl/geometry';
import { Mesh } from './gl/mesh';
import { Material } from './gl/material';
import { calculationTBN } from './math';
import { quadScreen } from './models/mesh/meshData';

export type n3<T> = [T, T, T]

const twoPass = ["frameBuffer", "hdr"];
export class ColorCamp {
    private _gl: WebGL2RenderingContext;
    public _shader: Nullable<Shader> = null;
    private _quadScreenShader: Nullable<Shader> = null;
    private _currentRAF: Nullable<number> = null;
    private framebufferVao: Nullable<WebGLVertexArrayObject> = null;
    private _defaultVao: Nullable<WebGLVertexArrayObject> = null;
    private frameBuffer: Nullable<WebGLFramebuffer> = null;
    private colorTexture: Nullable<WebGLTexture> = null;
    public camera: Nullable<Camera> = null;
    public light: Nullable<DirectionLight> = null;
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

    async compiler(key: string, mesh: Mesh, camera?: cameraOptions) {
        let { geometry, shader: meshshader, material, calcTBN, modelMatrix } = mesh;
        if (!modelMatrix) {
            modelMatrix = mat4.create();
        }
        if (twoPass.includes(key)) {
            await this.preFrambufferPass();
        }
        //TODO:DISPSOE
        if (this._currentRAF) {
            cancelAnimationFrame(this._currentRAF);
            this._currentRAF = null;
        }
        //TODO: LIGHT
        this.light = new DirectionLight(vec3.fromValues(1.0, 1.0, 1.0), vec3.normalize(vec3.create(), vec3.fromValues(-1, -1, -1)), vec3.fromValues(1, 1, 1), 1.)
        
        //TODO:CAMERA
        let cameraOpts: cameraOptions = {
            position: vec3.fromValues(0, 0, -200), 
            direction: vec3.fromValues(0, 0, -1), 
            up:  vec3.fromValues(0, 1, 0),
            perspective: {
                fov: glMatrix.toRadian(60),
                aspectRatio: this._gl.canvas.width / this._gl.canvas.height,
                near: 1,
                far: 1000
            }
        }
        let { fov, aspectRatio, near, far } = cameraOpts?.perspective as { fov: number, aspectRatio: number, near: number, far: number }
        this.camera = new Camera(cameraOpts);
        if (camera) {
            this.camera = new Camera(camera);
            fov = camera.perspective.fov;
            aspectRatio = camera.perspective.aspectRatio;
            near = camera.perspective.near;
            far = camera.perspective.far;
        }
        this.camera.perspective(fov, aspectRatio, near, far);

        ////TODO:PROGRAM
        const shader = this._shader = new Shader(this._gl);
        await shader.readShader(meshshader);
        shader.compilerShader();
        const program = shader.program as WebGLProgram;
        let vao = this._defaultVao =  this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        //TODO: CALCTBN
        if (calcTBN) {
            let stride = geometry.stride;
            let tnVertices = [];
            for (let i = 0; i < geometry.vertices.length; i += 24) {
                const p0 = geometry.vertices.slice(i, i + stride);
                const p1 = geometry.vertices.slice(i + stride, i + 2 * stride);
                const p2 = geometry.vertices.slice(i + 2 * stride, i + 3 * stride);
                const {tangent, bitangent } = calculationTBN({ p0, p1, p2 })
                for (let j = 0; j < 3; j++) {
                    tnVertices.push(...tangent,...bitangent);
                }
            }
            let tbnBuffer = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, tbnBuffer);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(tnVertices), this._gl.STATIC_DRAW);

            const itemLocation = this._gl.getAttribLocation(program, "a_tangent");
            this._gl.enableVertexAttribArray(itemLocation);
            this._gl.vertexAttribPointer(itemLocation, 3, this._gl.FLOAT, false, 6 * 4, 0);

            const bitangentLocation = this._gl.getAttribLocation(program, "a_bitangent");
            this._gl.enableVertexAttribArray(bitangentLocation);
            this._gl.vertexAttribPointer(bitangentLocation, 3, this._gl.FLOAT, false, 6 * 4, 4 * 3);
        }

        let buffer = this._gl.createBuffer();
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(geometry.vertices), this._gl.STATIC_DRAW);

        geometry.attris.forEach(attr =>{
            const itemLocation = this._gl.getAttribLocation(program, attr.key);
            this._gl.enableVertexAttribArray(itemLocation);
            this._gl.vertexAttribPointer(itemLocation, attr.size, this._gl.FLOAT, false, geometry.stride *4 , attr.offset * 4)
        })

        //TODO:TEXTURE
        if (material.diffuseTexture) {
            this.bindTexture(material.diffuseTexture, this._gl.TEXTURE0);
        }
        if (material.specularTexture) {
            this.bindTexture(material.specularTexture, this._gl.TEXTURE1);
        }
        if (material.emmisiveTexture) {
            this.bindTexture(material.emmisiveTexture, this._gl.TEXTURE2);
        }
        if (material.bumpTexture) {
            this.bindTexture(material.bumpTexture, this._gl.TEXTURE3);
        }
        this.draw(key, geometry, material, 0, modelMatrix as mat4);
    }
    
    bindTexture(url: string, idx: number) {
        // const ext = this._gl.getExtension("EXT_sRGB");
        const texture = this._gl.createTexture();
        let img = new Image();
        img.src = url;
        img.addEventListener("load", () => {
            this._gl.activeTexture(idx);
            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.REPEAT);
            this._gl.texParameteri(this._gl.TEXTURE_2D,this._gl.TEXTURE_WRAP_T, this._gl.REPEAT);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGB, img.width, img.height, 0, this._gl.RGB, this._gl.UNSIGNED_BYTE,img)
            this._gl.generateMipmap(this._gl.TEXTURE_2D);
        })
        
    }
    
    clearScene() {
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor( 0, 0, 0, 0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

    }

    draw(key: string, data: Geometry, material: Material, rotationRadian: number, modelMatrix: mat4) {
        rotationRadian += (glMatrix.toRadian(15)) / 60;
         if (twoPass.includes(key)) {
            //pass1
            this._gl.enable(this._gl.DEPTH_TEST);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this.frameBuffer as WebGLFramebuffer);
            this._gl.bindVertexArray(this._defaultVao as WebGLVertexArrayObject);
            this.frameBufferPass(data, material, rotationRadian, modelMatrix);

            //pass2
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            this._gl.disable(this._gl.DEPTH_TEST);
            this._gl.disable(this._gl.STENCIL_TEST);
            this._gl.bindVertexArray(this.framebufferVao as WebGLVertexArrayObject);
            this._gl.activeTexture(this._gl.TEXTURE4);
            this._gl.bindTexture(this._gl.TEXTURE_2D, this.colorTexture as WebGLTexture);
            this.frameBufferPass2();
         }else {
            this._gl.enable(this._gl.DEPTH_TEST);
            this.defaultPass(data, material, rotationRadian, modelMatrix);
         }
        this._currentRAF = requestAnimationFrame(this.draw.bind(this, key, data, material, rotationRadian, modelMatrix));
    }

    defaultPass(data: Geometry, material: Material, rotationRadian: number, modelMatrix: mat4) {
        //lights
        const lightPositions = [
            vec3.fromValues( 0.0,  0.0, 49.5),
            vec3.fromValues(-1.4, -1.9, 9.0),
            vec3.fromValues(0.0, -1.8, 4.0),
            vec3.fromValues(0.8, -1.7, 6.0)
        ]

        const lightColors = [
            vec3.fromValues( 200.0,  200.0, 200.0),
            vec3.fromValues(0.1, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 0.2),
            vec3.fromValues(0.0, 0.1, 0.0)
        ]

        //TODO:SETUNIFORMS
        //Varibles
        let normalMatrix = mat4.create();
        
        mat4.fromYRotation(modelMatrix, rotationRadian);
        mat4.transpose(normalMatrix, mat4.invert(normalMatrix,modelMatrix));

        this._shader?.use();

        for (let i = 0; i < lightPositions.length; i++)
        {
            this._shader?.setVec3(`lights[${i}].Position`, lightPositions[i]);
            this._shader?.setVec3(`lights[${i}].Color`, lightColors[i]);
        }

        this._shader?.setMatrix4x4("u_model", modelMatrix);
        this._shader?.setMatrix4x4("u_timodel", normalMatrix);
        this._shader?.setMatrix4x4("u_view", this.camera?.viewMatrix as mat4);
        this._shader?.setMatrix4x4("u_projection", this.camera?.projection as mat4);
        this._shader?.setVec3("light.dir", this.light?.direction as vec3);
        this._shader?.setVec3("light.color", this.light?.color as vec3);
        this._shader?.setFloat("light.intensity", this.light?.intensity as number);
        this._shader?.setVec3("material.diffuse", material.diffuse);
        this._shader?.setVec3("material.specular", material.specular);
        this._shader?.setVec3("material.ambient", material.ambient);
        this._shader?.setFloat("material.shininess", material.shininess);

        this._shader?.setVec4("glow", vec4.fromValues(0.0, 1.0, 0.0, 1.0));

        this._shader?.setVec3("view_position", this.camera?.position as vec3);

        this._shader?.setInt("material.dsampler", 0);
        this._shader?.setInt("material.ssampler", 1);
        this._shader?.setInt("material.esampler", 2);
        this._shader?.setInt("material.normalSampler", 3);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, data.vertices.length / data.stride);
        // this._gl.bindVertexArray(null);
    }

    frameBufferPass(data: Geometry, material: Material, rotationRadian: number, modelMatrix: mat4) {
        // this._gl.disable(this._gl.CULL_FACE)
        // this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        this.clearScene();
        this.defaultPass(data, material, rotationRadian, modelMatrix);
    }

    frameBufferPass2() {
        // this._gl.disable(this._gl.CULL_FACE);
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(.0, .0, .0, .0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        
        // this._gl.activeTexture(this._gl.TEXTURE0);
        // this._gl.bindTexture(this._gl.TEXTURE_2D, this.colorTexture as WebGLTexture);

        this._quadScreenShader?.use();
        
        
        this._quadScreenShader?.setInt("screenTexture", 4);
        this._gl.drawArrays(this._gl.TRIANGLES, 0, 6);
       
    }

    async preFrambufferPass() {
        let frameBuffer = this.frameBuffer = this._gl.createFramebuffer();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);
        this._gl.activeTexture(this._gl.TEXTURE4);
        let colorTexture = this.colorTexture =  this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, colorTexture);
        //获取webgl2.0扩展 支持浮点帧缓冲
        this._gl.getExtension("EXT_color_buffer_float");

       
        
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA16F, this._gl.canvas.width, this._gl.canvas.height, 0, this._gl.RGBA, this._gl.FLOAT, null);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);

        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, colorTexture, 0);

        //RenderBuffer
        let renderBuffer = this._gl.createRenderbuffer();
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, renderBuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH24_STENCIL8, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_STENCIL_ATTACHMENT, this._gl.RENDERBUFFER, renderBuffer);
        let status = this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER);
        if (status !== this._gl.FRAMEBUFFER_COMPLETE) {
            return;
        }
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        //vao
        let vao = this.framebufferVao = this._gl.createVertexArray();
        this._gl.bindVertexArray(vao);

        let buffer = this._gl.createBuffer();
        const _quadScreenShader = this._quadScreenShader = new Shader(this._gl);
        await _quadScreenShader.readShader('./src/shaders/frameBuffer');
        _quadScreenShader.compilerShader();
        _quadScreenShader.use();
        const program = _quadScreenShader.program as WebGLProgram;
        _quadScreenShader.setInt("screenTexture", 0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
        this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(quadScreen.vertices), this._gl.STATIC_DRAW);

        quadScreen.attris.forEach(attr =>{
            const itemLocation = this._gl.getAttribLocation(program, attr.key);
            this._gl.enableVertexAttribArray(itemLocation);
            this._gl.vertexAttribPointer(itemLocation, attr.size, this._gl.FLOAT, false, quadScreen.stride *4 , attr.offset * 4)
        })
        this._gl.bindVertexArray(null);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    }
}