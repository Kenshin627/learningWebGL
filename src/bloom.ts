import { vec3, mat4, glMatrix } from "gl-matrix";
import { Camera, cameraOptions } from "./gl/camera";
import { Mesh } from "./gl/mesh";
import { Shader } from "./gl/shader";

export class bloom {
    private mesh: Mesh;
    private cameraOpts: cameraOptions;
    private camera: Camera;
    private ctx: WebGL2RenderingContext;
    private shaders: Map<string, Shader>;
    private lightPositions: vec3[];
    private lightColors: vec3[];
    private models: mat4[] = [];
    private wood: WebGLTexture | null = null;
    private containerBox: WebGLTexture | null = null;
    constructor(mesh: Mesh, camera: cameraOptions, ctx: WebGL2RenderingContext){
        this.ctx = ctx;
        this.mesh = mesh;
        this.cameraOpts = camera;
        this.shaders = new Map();
        this.lightPositions = [
            vec3.fromValues(0.0, 0.5, 1.5),
            vec3.fromValues(-8.0, 7.0, -3.0),
            vec3.fromValues(6.0, 3.5, 1.0),
            vec3.fromValues(-0.8, 5.4 ,-1.0)
        ];

        this.lightColors = [
            vec3.fromValues(5.0 ,5.0, 5.0),
            vec3.fromValues(10.0, 0.0, 0.0),
            vec3.fromValues(0.0, 0.0, 15.0),
            vec3.fromValues(0.0, 5.0, 0.0)
        ];

        let cam = this.camera =  new Camera(camera);
        const { fov, aspectRatio, near, far } = camera.perspective;
        // cam.updateCameraVectors();
        cam.perspective(fov, aspectRatio, near, far);
    }

    buildVao() {
        let vao = this.ctx.createVertexArray();
        this.ctx.bindVertexArray(vao);
        let vbo = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, vbo);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(this.mesh.geometry.vertices), this.ctx.STATIC_DRAW);
        this.ctx.enableVertexAttribArray(0);
        this.ctx.vertexAttribPointer(0, 3, this.ctx.FLOAT, false, 8 * 4, 0);
        this.ctx.enableVertexAttribArray(1);
        this.ctx.vertexAttribPointer(1, 3, this.ctx.FLOAT, false, 8 * 4, 3 * 4);
        this.ctx.enableVertexAttribArray(2);
        this.ctx.vertexAttribPointer(2, 2, this.ctx.FLOAT, false, 8 * 4, 6 * 4);
    }

    async setupScene(){
        //models
        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromScaling(mat4.create(), vec3.fromValues(12.5, 0.5, 12.5)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(0.0, -1.0, 0.0))
        ));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromScaling(mat4.create(), vec3.fromValues(0.5, 0.5, 0.5)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(0.0, 1.5, 0.0))
        ));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromScaling(mat4.create(), vec3.fromValues(0.5, 0.5, 0.5)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(2.0, 0.0, 1.0))
        ));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromRotation(mat4.create(),glMatrix.toRadian(60.0), vec3.fromValues(1.0, 0.0, 1.0)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(-1.0, -1.0, 2.0))
        ));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromScaling(mat4.create(), vec3.fromValues(1.25, 1.25, 1.25)),
            mat4.multiply(
            mat4.create(), 
            mat4.fromRotation(mat4.create(),glMatrix.toRadian(23.0), vec3.fromValues(1.0, 0.0, 1.0)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(0.0, 2.7, 4.0))
        )));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromRotation(mat4.create(),glMatrix.toRadian(124.0), vec3.fromValues(1.0, 0.0, 1.0)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(-2.0, 1.0, -3.0))
        ));

        this.models.push(mat4.multiply(
            mat4.create(), 
            mat4.fromScaling(mat4.create(), vec3.fromValues(0.5, 0.5, 0.5)), 
            mat4.fromTranslation(mat4.create(), vec3.fromValues(-3.0, 0.0, 0.0))
        ));



        //texture
        let wood = './src/models/texture/wood.png';
        let container = './src/models/texture/container2.png';
        // this.bindTexture(wood, 0);
        // this.bindTexture(container, 1);
        const texture = this.wood  = this.ctx.createTexture();
        this.ctx.activeTexture(this.ctx.TEXTURE0);
        let img = new Image();
        img.src = wood;
        img.addEventListener("load", _ => {

            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.REPEAT);
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGB, img.width, img.height, 0, this.ctx.RGB, this.ctx.UNSIGNED_BYTE, img);
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        })

        const texture2 = this.containerBox  = this.ctx.createTexture();
        let img2 = new Image();
        img2.src = container;
        img2.addEventListener("load", _ => {
            this.ctx.activeTexture(this.ctx.TEXTURE0);
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture2);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.REPEAT);
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGB, img2.width, img2.height, 0, this.ctx.RGB, this.ctx.UNSIGNED_BYTE, img2);
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        })
        //vao
        this.buildVao();
        //compilorShader
        await this.compilorShader();

        //fbo
        // let fbo = this.ctx.createFramebuffer();
        // this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, fbo);


        // let fboTexture = this.ctx.createTexture();
        // this.ctx.texImage2D()
        // this.ctx.
    }

    renderLoop() {
        this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
        this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        this.ctx.viewport(0.0, 0.0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        // this.ctx.enable(this.ctx.STENCIL_TEST);
        // this.ctx.enable(this.ctx.CULL_FACE);
        this.ctx.disable(this.ctx.CULL_FACE);
        const bloomShader = this.shaders.get("bloom") as Shader;

        bloomShader.use();
        bloomShader.setMatrix4x4("u_projection", this.camera.projection);
        bloomShader.setMatrix4x4("u_view", this.camera.viewMatrix);
        // this.ctx.activeTexture(0);
        // this.bindTexture(this.ctx.TEXTURE_2D, )
        for (let i = 0; i < this.lightPositions.length; i++) {
            bloomShader.setVec3(`lights[${i}].Position`, this.lightPositions[i]);
            bloomShader.setVec3(`lights[${i}].Color`, this.lightColors[i]);
        }
        this.models.forEach((model,idx) => {
            if (idx === 0) {
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.wood);
            }else {
                this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.containerBox);
            }
            let normalMatrix = mat4.transpose(mat4.create(), mat4.invert(mat4.create(), model));
            bloomShader.setMatrix4x4("u_model", model);
            bloomShader.setMatrix4x4("U_normalMatrix", normalMatrix);
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 36);
        })
        //lights
        const lightShader = this.shaders.get("light") as Shader;
        lightShader.use();
        lightShader.setMatrix4x4("u_projection", this.camera.projection);
        lightShader.setMatrix4x4("u_view", this.camera.viewMatrix);
        this.lightPositions.forEach((lightPosition,i) => {
            lightShader.setMatrix4x4("u_model", mat4.multiply(mat4.create(), mat4.fromScaling(mat4.create(), vec3.fromValues(0.25, 0.25, 0.25)), mat4.fromTranslation(mat4.create(), lightPosition), ));
            lightShader.setVec3("lightColor", this.lightColors[i]);
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 36);
        })
        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async compilorShader(){
        let shader1 = './src/shaders/bloom';
        let shader2 = './src/shaders/light'
        let shader = new Shader(this.ctx);
        let shader22 = new Shader(this.ctx);
        this.shaders.set("bloom", shader);
        this.shaders.set("light", shader22);
        (await shader.readShader(shader1)).compilerShader();
        (await shader22.readShader(shader2)).compilerShader();
        shader.use();
        shader.setInt("diffuseTexture", 0);
    }

    bindTexture(url: string, idx: number){
        const texture  = this.ctx.createTexture();
        let img = new Image();
        img.src = url;
        img.addEventListener("load", _ => {
            this.ctx.activeTexture(this.ctx.TEXTURE0);
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.REPEAT);
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGB, img.width, img.height, 0, this.ctx.RGB, this.ctx.UNSIGNED_BYTE, img);
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        })
    }
}