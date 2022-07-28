import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Camera } from "../gl/camera";
import { Light } from "../gl/light";
import { GLTF, Mesh, MeshPrimitive, Scene, attribute, Sampler, CameraPerspectiveBase } from "../gl/loaders/sceneLoader/gltftypes";
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
    public light: Light;
    public camera?: Camera
    //temp
    public view?:mat4;
    constructor(ctx: WebGL2RenderingContext, source: GLTF){
        this.ctx = ctx;
        this.gltf = source;
        this.defaultScene = this.gltf.scene??this.gltf.scenes[0];
        this.defaultShader = new Shader(this.ctx);
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
        this.camera = new Camera(vec3.fromValues(0.0, 5.0, 4.0), vec3.fromValues(0.0, 2.0, -3.67), vec3.fromValues(0.0, 1.0, 0.0));
        this.camera.perspective(0.8, this.ctx.canvas.width / this.ctx.canvas.height, 0.0896, 8957.6039)
    }

   async setupScene() {
    this.initBuffer();
    this.initTexture();
    this.initSampler();

    (await this.defaultShader.readShader("./src/shaders/normal")).compilerShader();
    this.gltf.meshes.forEach((mesh: Mesh) => {
        mesh.primitives.forEach((primitive: MeshPrimitive) => {
            primitive.vertexArray = this.ctx.createVertexArray() as WebGLVertexArrayObject;
            this.ctx.bindVertexArray(primitive.vertexArray);
            for (const [ attribute, accessor ] of Object.entries(primitive.attributes)) {
                // if (!accessor?.bufferView.target) {
                    this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, accessor?.bufferView.buffer as WebGLBuffer);
                    this.ctx.bufferData(this.ctx.ARRAY_BUFFER, accessor?.bufferView.data as ArrayBuffer, this.ctx.STATIC_DRAW);
                    
                // }else {
                //     this.ctx.bindBuffer(accessor.bufferView.target, accessor.bufferView.buffer as WebGLBuffer);
                // }
                let location = this.ctx.getAttribLocation(this.defaultShader.program as WebGLProgram, ATTRIBUTEMAP.get(attribute) as string); 
                if (location !== -1) {
                    accessor?.prepareVertexAttribute(this.ctx, location);
                }
            }

            if (primitive.indices) {
                let bufferView = primitive.indices.bufferView;
                // if (bufferView.target == null || bufferView.target == undefined) {
                    this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.buffer as WebGLBuffer);
                    this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.data, this.ctx.STATIC_DRAW)
                // }else {
                //     this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, bufferView.buffer as WebGLBuffer);
                // }
            }

            this.ctx.bindVertexArray(null);
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
            this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
        })
    })
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

   renderLoop() {
        
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        // this.ctx.enable(this.ctx.CULL_FACE);
        this.defaultShader.use();
        this.gltf.meshes.forEach(mesh => {
            mesh.primitives.forEach(primitive => {
                // this.ctx.useProgram(primitive.shader?.program as WebGLProgram);
                // primitive.shader?.use();
                this.ctx.bindVertexArray(primitive.vertexArray as WebGLVertexArrayObject);
                const modelInvertTranspose = mat4.create();
          
                // mat4.multiply(modelM, mat4.invert(modelM, this.view as mat4), mesh.modelMatrix as mat4);
                // primitive.shader?.setMatrix4x4("u_model", modelM);
                mat4.transpose(modelInvertTranspose, mat4.invert(modelInvertTranspose, mesh.modelMatrix as mat4));
                this.defaultShader.setMatrix4x4("u_timodel", modelInvertTranspose);
                this.defaultShader.setMatrix4x4("u_model", mesh.modelMatrix as mat4);
                this.defaultShader.setMatrix4x4("u_view", (this.camera as Camera).lookAt);
                this.defaultShader.setMatrix4x4("u_projection", (this.camera as Camera).projection);
                if (primitive.indices) {
                    this.ctx.drawElements(primitive.mode, primitive.indices.count, primitive.indices.componentType, primitive.indices.byteOffset);
                }else {
                    this.ctx.drawArrays(primitive.mode, primitive.drawIndices?.byteOffset as number, primitive.drawIndices?.count as number);
                }
                this.ctx.bindVertexArray(null);
            })
        })
        requestAnimationFrame(this.renderLoop.bind(this));
   }
}