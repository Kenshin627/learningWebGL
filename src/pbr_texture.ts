import { vec3, vec2, mat4 } from "gl-matrix";
import { Camera, cameraOptions } from "./gl/camera";
import { VertexArrayObject } from "./gl/loaders/sceneLoader/model";
import { Shader } from "./gl/shader";

export class PBR_TEXTURE {
    private ctx: WebGL2RenderingContext;
    private cameraOpts: cameraOptions;
    private camera: Camera;
    private pbrShader: Shader;
    private VAO: VertexArrayObject | null = null;
    private lightsPosition: vec3[] = [];
    private lightsColor: vec3[] = [];
    private nCols: number = 7;
    private nRows: number = 7;
    private indicesCount: number = 0;
    private renderTime: number = 0;
    private textures: WebGLTexture[] = [];
    constructor(ctx: WebGL2RenderingContext, cameraOpts: cameraOptions) {
        
        this.cameraOpts = cameraOpts;
        this.ctx = ctx;
        this.pbrShader = new Shader(this.ctx);
        let cam = this.camera = new Camera(this.cameraOpts);
        // cam.updateCameraVectors();
        const { fov, aspectRatio, near, far } = this.cameraOpts.perspective;
        cam.perspective(fov, aspectRatio, near, far);
        this.lightsPosition.push(vec3.fromValues(-10.0,  10.0, 10.0));
        this.lightsPosition.push(vec3.fromValues( 10.0,  10.0, 10.0));
        this.lightsPosition.push(vec3.fromValues(-10.0, -10.0, 10.0));
        this.lightsPosition.push(vec3.fromValues( 10.0, -10.0, 10.0));

        this.lightsColor.push(vec3.fromValues(300, 300, 300));
        this.lightsColor.push(vec3.fromValues(300, 300, 300));
        this.lightsColor.push(vec3.fromValues(300, 300, 300));
        this.lightsColor.push(vec3.fromValues(300, 300, 300));
    }

    async setupScene() {
        await this.compolorShader();
        this.buildVAO();
        this.ctx.enable(this.ctx.DEPTH_TEST);
        let textures = ["albedo", "metallic", "normal", "roughness"];
        textures.forEach((t,idx) => {
            this.bindTexture(`./src/models/texture/pbr/${t}.png`, idx);
        })
        // this.ctx.enable(this.ctx.CULL_FACE);
    }

    bindTexture(url: string, idx: number) { 
        let texture = this.ctx.createTexture() as WebGLTexture;
        this.textures.push(texture);
        let img = new Image();
        img.src = url;
        img.addEventListener("load", () => {
            this.ctx.activeTexture(this.ctx.TEXTURE0 + idx);
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.REPEAT);
            this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.REPEAT);
            this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGB, img.width, img.height, 0, this.ctx.RGB, this.ctx.UNSIGNED_BYTE, img);
            this.ctx.generateMipmap(this.ctx.TEXTURE_2D);
        })
    }

    async compolorShader() {
        (await this.pbrShader.readShader("./src/shaders/pbr_texture")).compilerShader();
        this.pbrShader.use();
        // this.pbrShader.setVec3("albedo", vec3.fromValues(1.0, 0.0, 1.0));
        this.pbrShader.setFloat("ao", 1.0);
        this.pbrShader.setInt("albedoSampler", 0);
        this.pbrShader.setInt("metallicSampler", 1);
        this.pbrShader.setInt("normalSampler", 2);
        this.pbrShader.setInt("roughnessSampler", 3);
    }

    buildVAO() {
        this.VAO = this.ctx.createVertexArray() as WebGLVertexArrayObject;
        let vbo = this.ctx.createBuffer() as WebGLBuffer;
        let ebo = this.ctx.createBuffer() as WebGLBuffer;

        const positions = [];
        const uvs = [];
        const normals = [];
        const indices = [];
        const x_segment = 64;
        const y_segment = 64;
        for (let i = 0; i <= x_segment; i++) {
            for (let j = 0; j <= y_segment; j++) {
               let xSegment = i / x_segment;
               let ySegment = j / y_segment;
               let xPos = Math.cos(xSegment * 2.0 * Math.PI) * Math.sin(ySegment * Math.PI);
               let yPos = Math.cos(ySegment * Math.PI);
               let zPos = Math.sin(xSegment * 2.0 * Math.PI) * Math.sin(ySegment * Math.PI);
               positions.push(vec3.fromValues(xPos, yPos, zPos));
               uvs.push(vec2.fromValues(xSegment, ySegment));
               normals.push(vec3.fromValues(xPos, yPos, zPos));
            }
        }

        let oddRow = false;
        for (let y = 0; y < y_segment; ++y) {
            if (!oddRow) {
                for (let x = 0; x <= x_segment; x++) {
                   indices.push(y * (x_segment + 1) + x);
                   indices.push((y+1) * (x_segment +1) + x);
                }
            }else {
                for (let x = x_segment; x >=0; x--) {
                    indices.push((y+1)*(x_segment + 1) + x);
                    indices.push(y*(x_segment + 1) + x);
                }
            }
            oddRow = !oddRow;
        }

        this.indicesCount = indices.length;

        let data: number[] = [];
        for (let i = 0; i < positions.length; i++) {
            const element = positions[i];
            data.push(element[0]);
            data.push(element[1]);
            data.push(element[2]);

            if (normals.length > 0) {
                data.push(normals[i][0]);
                data.push(normals[i][1]);
                data.push(normals[i][2]);
            }

            if (uvs.length > 0) {
                data.push(uvs[i][0]);
                data.push(uvs[i][1]);
            }
        }

        this.ctx.bindVertexArray(this.VAO);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, vbo);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(data), this.ctx.STATIC_DRAW);

        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, ebo);
        this.ctx.bufferData(this.ctx.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), this.ctx.STATIC_DRAW);

        let stride = ( 3 + 2 + 3 ) * 4;
        this.ctx.enableVertexAttribArray(0);
        this.ctx.vertexAttribPointer(0, 3, this.ctx.FLOAT, false, stride, 0);

        this.ctx.enableVertexAttribArray(1);
        this.ctx.vertexAttribPointer(1, 3, this.ctx.FLOAT, false, stride, 3 * 4);

        this.ctx.enableVertexAttribArray(2);
        this.ctx.vertexAttribPointer(2, 2, this.ctx.FLOAT, false, stride, 6 * 4);
    }

    renderLoop() {
        this.renderTime += 0.01;
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
        this.ctx.clearColor(0.1, 0.1, 0.1, 1.0);

        this.ctx.bindVertexArray(this.VAO);
        this.pbrShader.setMatrix4x4("u_projection", this.camera.projection);
        this.pbrShader.setMatrix4x4("u_view", this.camera.viewMatrix);
        this.pbrShader.setVec3("camPos", this.camera.position);
        const spacing = 2.5;

        this.textures.forEach((t,idx) => {
            this.ctx.activeTexture(this.ctx.TEXTURE0 + idx);
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, t);
        })
        this.pbrShader.setInt("albedoSampler", 0);
        this.pbrShader.setInt("metallicSampler", 1);
        this.pbrShader.setInt("normalSampler", 2);
        this.pbrShader.setInt("roughnessSampler", 3);

        //lights
        for (let i = 0; i < this.lightsPosition.length; i++) {
            let newPostion = vec3.create();
            vec3.add(newPostion, this.lightsPosition[i], vec3.fromValues(Math.sin(this.renderTime * 5.0)*5.0, 0.0, 0.0));
            this.pbrShader.setVec3(`lightPositions[${i}]`, newPostion);
            this.pbrShader.setVec3(`lightColors[${i}]`, this.lightsColor[i]);
        }
       
        let model = mat4.create();
        mat4.fromTranslation(model, vec3.fromValues((3 - (this.nCols / 2)) * spacing, (4 - this.nRows / 2) * spacing, 0.0));
        this.pbrShader.setMatrix4x4("u_model", model);
        this.ctx.drawElements(this.ctx.TRIANGLE_STRIP, this.indicesCount, this.ctx.UNSIGNED_INT, 0);

        requestAnimationFrame(this.renderLoop.bind(this));
    }
}

