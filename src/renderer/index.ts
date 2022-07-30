import {  glMatrix, mat4, vec3 } from "gl-matrix";
import { Camera } from "../gl/camera";
import { Light } from "../gl/light";
import { RenderType } from "../gl/loaders/sceneLoader/gltftypes";
import { boundingBoxRender, GLTF, Mesh, MeshPrimitive, Scene } from "../gl/loaders/sceneLoader/model"
import { Shader } from "../gl/shader";

export const ATTRIBUTEMAP = new Map<string, string>([
    ["POSITION","a_position"],
    ["NORMAL","a_normal"],
    ["TEXCOORD_0","a_texcoord"]
])

export class Renderer {
    // public canvas: HTMLCanvasElement;
    public ctx: WebGL2RenderingContext;
    public gltf: GLTF;
    public defaultScene: Scene;
    public defaultShader: Shader;
    public depthShader: Shader;
    public wireFrameShader: Shader;
    public depth1Pass: Shader;
    public light: Light;
    public camera?: Camera;
    public showBoundingBox: boolean = false;
    public frameBuffer?: WebGLFramebuffer;
    public depthTexture?: WebGLTexture;
    //temp
    public view?:mat4;
    constructor(ctx: WebGL2RenderingContext, source: GLTF){
        this.ctx = ctx;
        this.gltf = source;
        this.defaultScene = this.gltf.scene??this.gltf.scenes[0];
        this.defaultShader = new Shader(this.ctx);
        this.wireFrameShader = new Shader(this.ctx);
        this.depthShader = new Shader(this.ctx);
        this.depth1Pass = new Shader(this.ctx);
        this.light = new Light(vec3.fromValues(1.0, 1.0, 1.0), vec3.fromValues( 1.0, 1.0, 1.0), 1.0);
        // if (this.gltf.cameras && this.gltf.cameras.length) {
        //     const { yfov, zfar, znear, aspectRatio } = this.gltf.cameras[0].perspective as CameraPerspectiveBase;
        //     this.view = this.gltf.cameras[0].lookAt;
        //     this.camera = new Camera(vec3.fromValues(0.0, 0.0, 0), vec3.fromValues(0.0, 0.0, -1.0), vec3.fromValues(0.0, 1.0, 0.0));
        //     this.camera.perspective(yfov, this.ctx.canvas.width / this.ctx.canvas.height, znear, zfar as number);
        // }else {
            this.constructorDefaultCamera();
        // }
       
    }

    constructorDefaultCamera() {
        this.camera = new Camera(vec3.fromValues(0.0, .0, 2.0), vec3.fromValues(0.0, 1.0, -3.67), vec3.fromValues(0.0, 1.0, 0.0));
        this.camera.perspective(0.8, this.ctx.canvas.width / this.ctx.canvas.height, 0.0896, 10.6039)
    }

    async setupScene() {
        this.initBuffer();
        this.initTexture();
        this.initSampler();
        // this.preDepthRenderFrameBuffer();
        let shader = null;
        let bboxRenderingPromise: Promise<void>[] = [];
        (await this.defaultShader.readShader("./src/shaders/normal")).compilerShader();
        (await this.wireFrameShader.readShader("./src/shaders/wireFrame")).compilerShader();
        (await this.depthShader.readShader("./src/shaders/depthField")).compilerShader();
        // (await this.depth1Pass.readShader("./src/shaders/depth1Pass")).compilerShader();
        this.gltf.meshes.forEach((mesh: Mesh) => {
            if (mesh.boundingBox) {
                mesh.boundingBox.bboxRender = new boundingBoxRender(this.ctx);
                bboxRenderingPromise.push(mesh.boundingBox.bboxRender.preDraw());
            }
            mesh.primitives.forEach((primitive: MeshPrimitive) => {
                primitive.vertexArray = this.ctx.createVertexArray() as WebGLVertexArrayObject;
                // primitive.shader = this.defaultShader;
                // shader = mesh.renderMode === RenderType.SHADING ? primitive.shader: mesh.renderMode === RenderType.DEPTH? this.depthShader: this.wireFrameShader;
                this.ctx.bindVertexArray(primitive.vertexArray);
                Object.entries(primitive.attributes).forEach( ([attribute, accessor],idx) => {
                    if (!accessor?.bufferView.target) {
                        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, accessor?.bufferView.buffer as WebGLBuffer);
                        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, accessor?.bufferView.data as ArrayBuffer, this.ctx.STATIC_DRAW);
                        
                    }else {
                        this.ctx.bindBuffer(accessor.bufferView.target, accessor.bufferView.buffer as WebGLBuffer);
                    }
                    // let location = this.ctx.getAttribLocation(shader.program as WebGLProgram, ATTRIBUTEMAP.get(attribute) as string); 
                    // if (location !== -1) {
                    //     accessor?.prepareVertexAttribute(this.ctx, location);
                    // }
                    // this.ctx.getAttribLocation(primitive.s)
                    accessor?.prepareVertexAttribute(this.ctx, idx);
                })
                // for (const [ attribute, accessor ] of Object.entries(primitive.attributes)) {
                //     if (!accessor?.bufferView.target) {
                //         this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, accessor?.bufferView.buffer as WebGLBuffer);
                //         this.ctx.bufferData(this.ctx.ARRAY_BUFFER, accessor?.bufferView.data as ArrayBuffer, this.ctx.STATIC_DRAW);
                        
                //     }else {
                //         this.ctx.bindBuffer(accessor.bufferView.target, accessor.bufferView.buffer as WebGLBuffer);
                //     }
                //     // let location = this.ctx.getAttribLocation(shader.program as WebGLProgram, ATTRIBUTEMAP.get(attribute) as string); 
                //     // if (location !== -1) {
                //     //     accessor?.prepareVertexAttribute(this.ctx, location);
                //     // }
                //     // this.ctx.getAttribLocation(primitive.s)
                //     accessor?.prepareVertexAttribute(this.ctx, 0);

                // }

                if (primitive.indices) {
                    let bufferView = primitive.indices.bufferView;
                    if (bufferView.target == null || bufferView.target == undefined) {
                        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.buffer as WebGLBuffer);
                        this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.data, this.ctx.STATIC_DRAW)
                    }else {
                        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.buffer as WebGLBuffer);
                    }
                }

                this.ctx.bindVertexArray(null);
                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
                this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
            })
        })
        await Promise.all(bboxRenderingPromise);
    }

    preDepthRenderFrameBuffer() {
        let depthTexture = this.depthTexture = this.ctx.createTexture() as WebGLTexture;
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, depthTexture);
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.DEPTH_COMPONENT16, 1024, 1024, 0, this.ctx.DEPTH_COMPONENT, this.ctx.UNSIGNED_SHORT, null);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.LINEAR)
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.LINEAR);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);

        let fb = this.frameBuffer = this.ctx.createFramebuffer() as WebGLFramebuffer;
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, fb);

        const attachmentPoint = this.ctx.DEPTH_ATTACHMENT;
        this.ctx.framebufferTexture2D(this.ctx.FRAMEBUFFER, attachmentPoint, this.ctx.TEXTURE_2D, depthTexture, 0);
    }
   
   initBuffer() {
        this.gltf.bufferViews.forEach(bufferView => {
            bufferView.createBuffer(this.ctx);
            bufferView.bindData(this.ctx);
        })
   }

   initTexture() {
    this.gltf.textures.forEach(texture => {
        texture.createTexture(this.ctx);
    })
   }

   initSampler(){
    this.gltf.samplers.forEach(sampler => {
        sampler.createSampler(this.ctx);
    })
   }

   _defaultRenderPass(shader?: Shader) {
    this.gltf.meshes.forEach(mesh => {
        const modelInvertTranspose = mat4.create();
        let modelMatrix = mesh.modelMatrix as mat4;
        let rotationY = mat4.create();
        let res = mat4.create();
        let bboxModelMatrix = mat4.create();
        mat4.fromYRotation(rotationY, radian)
        mat4.multiply(res, rotationY, modelMatrix);
        mat4.multiply(bboxModelMatrix, res, mesh.boundingBox?.transform as mat4);
        mat4.transpose(modelInvertTranspose, mat4.invert(modelInvertTranspose, modelMatrix));

        if (this.showBoundingBox) {
            const bboxRender = mesh.boundingBox?.bboxRender as boundingBoxRender;
            bboxRender?.shader.use();
            this.ctx.bindVertexArray(bboxRender?.vertexArray);
            bboxRender.shader.setVec3("lineColor", vec3.fromValues(0.5, 1.0, 0.2));
            bboxRender.shader.setMatrix4x4("u_model", bboxModelMatrix);
            bboxRender.shader.setMatrix4x4("u_view", (this.camera as Camera).lookAt);
            bboxRender.shader.setMatrix4x4("u_projection", (this.camera as Camera).projection);
            this.ctx.drawArrays(this.ctx.LINES, 0, 24);
            this.ctx.bindVertexArray(null);
        }
        mesh.primitives.forEach(primitive => {
            if (!shader) {
                shader = mesh.renderMode === RenderType.SHADING ? primitive.shader: mesh.renderMode === RenderType.DEPTH? this.depthShader: this.wireFrameShader;
            }
            shader?.use();
            this.ctx.bindVertexArray(primitive.vertexArray as WebGLVertexArrayObject);
            shader?.setMatrix4x4("u_model", res);
            shader?.setMatrix4x4("u_view", (this.camera as Camera).lookAt);
            shader?.setMatrix4x4("u_projection", (this.camera as Camera).projection);
            switch (mesh.renderMode) {
                case RenderType.SHADING:
                    shader?.setMatrix4x4("u_timodel", modelInvertTranspose);
                    break;
                case RenderType.WIREFRAME:
                    shader?.setVec3("lineColor", vec3.fromValues(1.0, 0.8, 0.25));
                    break;
                case RenderType.DEPTH:
                    shader?.setFloat("near", this.camera?.nearPlane as number);
                    shader?.setFloat("far", this.camera?.farPlane as number);
                    // shader?.setInt("depthSampler", 0);
                    break;
                default:
                    break;
            }
            if (primitive.indices) {
                this.ctx.drawElements(mesh.renderMode === RenderType.WIREFRAME? this.ctx.LINES : primitive.mode, primitive.indices.count, primitive.indices.componentType, primitive.indices.byteOffset);
            }else {
                this.ctx.drawArrays(mesh.renderMode === RenderType.WIREFRAME? this.ctx.LINES : primitive.mode, primitive.drawIndices?.byteOffset as number, primitive.drawIndices?.count as number);
            }
            this.ctx.bindVertexArray(null);
        })
    })
   }

   depthRenderPass() {
        this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.frameBuffer as WebGLFramebuffer);
        this.ctx.viewport(0, 0, 1024, 1024);
        this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        this._defaultRenderPass(this.depth1Pass);
   }

   renderLoop() {
        radian += glMatrix.toRadian(15)/ 60;
        this.ctx.enable(this.ctx.DEPTH_TEST);
        this.ctx.enable(this.ctx.CULL_FACE);
        // this.depthRenderPass();

        // this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);
        // this.ctx.activeTexture(this.ctx.TEXTURE0);
        // this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.depthTexture as WebGLTexture);
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        this._defaultRenderPass();
        requestAnimationFrame(this.renderLoop.bind(this));
   }
}

let radian = 0;