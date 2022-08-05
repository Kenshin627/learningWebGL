import { Camera, cameraOptions } from "./gl/camera";
import { Mesh } from "./gl/mesh";
import { Shader } from "./gl/shader";

export class bloom {
    private mesh: Mesh;
    private cameraOpts: cameraOptions;
    private camera: Camera;
    private ctx: WebGL2RenderingContext;
    constructor(mesh: Mesh, camera: cameraOptions, ctx: WebGL2RenderingContext){
        this.ctx = ctx;
        this.mesh = mesh;
        this.cameraOpts = camera;
        let cam = this.camera =  new Camera(camera);
        const { fov, aspectRatio, near, far } = camera.perspective;
        cam.perspective(fov, aspectRatio, near, far);
        this.buildVao();
        this.renderLoop();
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

    setupScene(){

    }

    renderLoop() {
        this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
        this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
        this.ctx.viewport(0.0, 0.0, this.ctx.canvas.width, this.ctx.canvas.height);

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    async compilorShader(){
        let shader1 = './src/shaders/bloom';
        let shader = new Shader(this.ctx);
        await (await shader.readShader(shader1)).compilerShader();
    }
}