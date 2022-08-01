import { glMatrix, mat4, vec3 } from "gl-matrix";
import { Camera } from "../gl/camera";
import { DirectionLight } from "../gl/light";
import { RenderType } from "../gl/loaders/sceneLoader/gltftypes";
import {
  BoundingBox,
  boundingBoxRender,
  GLTF,
  Mesh,
  MeshPrimitive,
  Scene,
} from "../gl/loaders/sceneLoader/model";
import { Shader } from "../gl/shader";

export const ATTRIBUTEMAP = new Map<string, string>([
  ["POSITION", "a_position"],
  ["NORMAL", "a_normal"],
  ["TEXCOORD_0", "a_texcoord"],
]);

export type shaderType =
  | "default"
  | "wireFrame"
  | "depthField"
  | "shadow1Pass"
  | "shadow2Pass"
  | "aabb";

const SHADERDIR = "./src/shaders/";
const wireFrameColor = vec3.fromValues(0.2, 0.5, 0.8);
export class Renderer {
  public ctx: WebGL2RenderingContext;
  public gltf: GLTF;
  public defaultScene: Scene;
  public shaderStore: Record<shaderType, { shader: Shader; source: string }>;
  public light: DirectionLight;
  public camera: Camera;
  public showBoundingBox: boolean = false;
  public frameBuffer?: WebGLFramebuffer;
  public depthTexture?: WebGLTexture;
  public lightSpaceMatrix: mat4;
  public renderLoopListener: Function[] = [];
  constructor(ctx: WebGL2RenderingContext, source: GLTF) {
    this.ctx = ctx;
    this.gltf = source;
    this.camera = new Camera();
    this.defaultScene = this.gltf.scene ?? this.gltf.scenes[0];
    this.shaderStore = {
      default: { shader: new Shader(this.ctx), source: "normal" },
      wireFrame: { shader: new Shader(this.ctx), source: "wireFrame" },
      depthField: { shader: new Shader(this.ctx), source: "depthField" },
      shadow2Pass: { shader: new Shader(this.ctx), source: "shadow" },
      shadow1Pass: { shader: new Shader(this.ctx), source: "depthTexturePass" },
      aabb: { shader: new Shader(this.ctx), source: "aabb" },
    };
    this.constructorDefaultCamera();

    this.light = new DirectionLight(
      vec3.fromValues(1.0, 1.0, -1.0),
      vec3.fromValues(0, 0, 0),
      vec3.fromValues(-2, 4, -1),
      1.0
    );
    const lightProjection = mat4.ortho(
      mat4.create(),
      -10,
      10,
      -10,
      10,
      0.08,
      10.6
    );
    const lightView = mat4.lookAt(
      mat4.create(),
      this.light.position,
      this.light.direction,
      vec3.fromValues(0, 1, 0)
    );
    this.lightSpaceMatrix = mat4.create();
    mat4.multiply(this.lightSpaceMatrix, lightProjection, lightView);
  }

  constructorDefaultCamera() {
    // this.camera.lookAt({
    //   position: vec3.fromValues(0, 0, 3),
    //   direction: vec3.fromValues(0, 1, -4),
    //   up: vec3.fromValues(0, 1, 0),
    // });
    // this.camera.perspective(
    //   0.8,
    //   this.ctx.canvas.width / this.ctx.canvas.height,
    //   0.0896,
    //   10.6039
    // );
    this.camera.lookAt({
      position: vec3.fromValues(-1, 5, 10),
      direction: vec3.fromValues(-0, -1, -1),
      up: vec3.fromValues(0, 0.5, 0)
    })
    this.camera.perspective(
      0.8,
      this.ctx.canvas.width / this.ctx.canvas.height,
      0.0896,
      20.6039
    );
  }

  constructorDefaultLight() {}

  async compilerShaders() {
    for (const [_, { shader, source }] of Object.entries(this.shaderStore)) {
      (await shader.readShader(`${SHADERDIR}${source}`)).compilerShader();
    }
  }

  async setupScene() {
    this.initBuffer();
    this.initTexture();
    this.initSampler();
    await this.compilerShaders();

    this.ctx.enable(this.ctx.DEPTH_TEST);
    this.ctx.enable(this.ctx.CULL_FACE);
    this.preDepthRenderFrameBuffer();
    this.gltf.meshes.forEach((mesh: Mesh) => {
      if (mesh.boundingBox) {
        mesh.boundingBox.bboxRender = new boundingBoxRender(this.ctx);
      }
      mesh.primitives.forEach((primitive: MeshPrimitive) => {
        primitive.vertexArray =
          this.ctx.createVertexArray() as WebGLVertexArrayObject;
        this.ctx.bindVertexArray(primitive.vertexArray);
        Object.entries(primitive.attributes).forEach(([_, accessor], idx) => {
          if (!accessor?.bufferView.target) {
            this.ctx.bindBuffer(
              this.ctx.ARRAY_BUFFER,
              accessor?.bufferView.buffer as WebGLBuffer
            );
            this.ctx.bufferData(
              this.ctx.ARRAY_BUFFER,
              accessor?.bufferView.data as ArrayBuffer,
              this.ctx.STATIC_DRAW
            );
          } else {
            this.ctx.bindBuffer(
              accessor.bufferView.target,
              accessor.bufferView.buffer as WebGLBuffer
            );
          }
          accessor?.prepareVertexAttribute(this.ctx, idx);
        });

        if (primitive.indices) {
          let bufferView = primitive.indices.bufferView;
          if (bufferView.target == null || bufferView.target == undefined) {
            this.ctx.bindBuffer(
              this.ctx.ELEMENT_ARRAY_BUFFER,
              bufferView.buffer as WebGLBuffer
            );
            this.ctx.bufferData(
              this.ctx.ELEMENT_ARRAY_BUFFER,
              bufferView.data,
              this.ctx.STATIC_DRAW
            );
          } else {
            this.ctx.bindBuffer(
              this.ctx.ELEMENT_ARRAY_BUFFER,
              bufferView.buffer as WebGLBuffer
            );
          }
        }

        this.ctx.bindVertexArray(null);
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, null);
        this.ctx.bindBuffer(this.ctx.ELEMENT_ARRAY_BUFFER, null);
      });
    });
  }

  preDepthRenderFrameBuffer() {
    this.depthTexture = this.ctx.createTexture() as WebGLTexture;
    this.ctx.bindTexture(this.ctx.TEXTURE_2D, this.depthTexture);
    this.ctx.texImage2D(
      this.ctx.TEXTURE_2D,
      0,
      this.ctx.DEPTH_COMPONENT16,
      1024,
      1024,
      0,
      this.ctx.DEPTH_COMPONENT,
      this.ctx.UNSIGNED_SHORT,
      null
    );
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_MAG_FILTER,
      this.ctx.NEAREST
    );
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_MIN_FILTER,
      this.ctx.NEAREST
    );
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_WRAP_S,
      this.ctx.CLAMP_TO_EDGE
    );
    this.ctx.texParameteri(
      this.ctx.TEXTURE_2D,
      this.ctx.TEXTURE_WRAP_T,
      this.ctx.CLAMP_TO_EDGE
    );

    this.frameBuffer = this.ctx.createFramebuffer() as WebGLFramebuffer;
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, this.frameBuffer);

    const attachmentPoint = this.ctx.DEPTH_ATTACHMENT;
    this.ctx.framebufferTexture2D(
      this.ctx.FRAMEBUFFER,
      attachmentPoint,
      this.ctx.TEXTURE_2D,
      this.depthTexture,
      0
    );
  }

  initBuffer() {
    this.gltf.bufferViews.forEach((bufferView) => {
      bufferView.createBuffer(this.ctx);
      bufferView.bindData(this.ctx);
    });
  }

  initTexture() {
    this.gltf.textures.forEach((texture) => {
      texture.createTexture(this.ctx);
    });
  }

  initSampler() {
    this.gltf.samplers.forEach((sampler) => {
      sampler.createSampler(this.ctx);
    });
  }

  _aabbRender(bbox: BoundingBox, lineColor: vec3, modelMatrix: mat4) {
    const bboxRender = bbox.bboxRender as boundingBoxRender;
    const bboxShader = this.shaderStore.aabb.shader;
    bboxShader.use();
    this.ctx.bindVertexArray(bboxRender?.vertexArray);
    bboxShader.setVec3("lineColor", lineColor);
    bboxShader.setMatrix4x4("u_model", modelMatrix);
    bboxShader.setMatrix4x4("u_view", this.camera.viewMatrix);
    bboxShader.setMatrix4x4("u_projection", this.camera.projection);
    this.ctx.drawArrays(this.ctx.LINES, 0, 24);
    this.ctx.bindVertexArray(null);
  }

  useShader(mesh: Mesh, primitive: MeshPrimitive, shader?: Shader) {
    let res: Shader;
    if (shader) {
      res = shader;
    } else {
      switch (mesh.renderMode) {
        case RenderType.SHADING:
          res = primitive.shader as Shader;
          break;
        case RenderType.DEPTH:
          res = this.shaderStore.depthField.shader;
          break;
        case RenderType.SHADOW:
          res = this.shaderStore.shadow2Pass.shader;
          break;
        default:
          throw new Error("no shader support!");

          break;
      }
    }
    res.use();
    return res;
  }

  _defaultRenderPass(shader?: Shader) {
    this.gltf.meshes.forEach((mesh) => {
      const modelInvertTranspose = mat4.create();
      let modelMatrix = mesh.modelMatrix as mat4;
      let rotationY = mat4.create();
      let res = mat4.create();
      let bboxModelMatrix = mat4.create();
      mat4.fromYRotation(rotationY, radian);
      mat4.multiply(res, rotationY, modelMatrix);
      mat4.multiply(bboxModelMatrix, res, mesh.boundingBox?.transform as mat4);
      mat4.transpose(
        modelInvertTranspose,
        mat4.invert(modelInvertTranspose, modelMatrix)
      );

      //TODO: AABB RENDER
      this.showBoundingBox &&
        mesh.boundingBox &&
        this._aabbRender(mesh.boundingBox, wireFrameColor, bboxModelMatrix);

      mesh.primitives.forEach((primitive) => {
        let curShader = this.useShader(mesh, primitive, shader);
        this.ctx.bindVertexArray(
          primitive.vertexArray as WebGLVertexArrayObject
        );
        curShader.setMatrix4x4("u_model", res);
        curShader.setMatrix4x4("u_view", this.camera.viewMatrix);
        curShader.setMatrix4x4(
          "u_projection",
          (this.camera as Camera).projection
        );
        curShader.setMatrix4x4("lightPositionMatrix", this.lightSpaceMatrix);
        switch (mesh.renderMode) {
          case RenderType.SHADING:
            curShader.setMatrix4x4("u_timodel", modelInvertTranspose);
            break;
          case RenderType.WIREFRAME:
            curShader.setVec3("lineColor", vec3.fromValues(1.0, 0.8, 0.25));
            break;
          case RenderType.DEPTH:
            curShader.setFloat("near", this.camera?.nearPlane as number);
            curShader.setFloat("far", this.camera?.farPlane as number);
            break;
          case RenderType.SHADOW:
            curShader.setVec3("randomColor", primitive.test)
            curShader.setInt("depthSampler", 0);
            curShader.setVec3("lightPosition", this.light.position);
          default:
            break;
        }
        if (primitive.indices) {
          this.ctx.drawElements(
            mesh.renderMode === RenderType.WIREFRAME
              ? this.ctx.LINES
              : primitive.mode,
            primitive.indices.count,
            primitive.indices.componentType,
            primitive.indices.byteOffset
          );
        } else {
          this.ctx.drawArrays(
            mesh.renderMode === RenderType.WIREFRAME
              ? this.ctx.LINES
              : primitive.mode,
            primitive.drawIndices?.byteOffset as number,
            primitive.drawIndices?.count as number
          );
        }
        this.ctx.bindVertexArray(null);
      });
    });
  }

  depthRenderPass() {
    this.ctx.bindFramebuffer(
      this.ctx.FRAMEBUFFER,
      this.frameBuffer as WebGLFramebuffer
    );
    this.initialScene(this.ctx.canvas.width, this.ctx.canvas.height);
    this._defaultRenderPass(this.shaderStore.shadow1Pass.shader);
  }

  initialScene(width: number, height: number) {
    this.ctx.viewport(0, 0, width, height);
    this.ctx.clearColor(0.0, 0.0, 0.0, 0.0);
    this.ctx.clear(this.ctx.DEPTH_BUFFER_BIT | this.ctx.COLOR_BUFFER_BIT);
  }

  renderLoop() {
    if (this.renderLoopListener && this.renderLoopListener.length) {
        this.renderLoopListener.forEach( f => {
            f && f();
        })
    }
    radian += glMatrix.toRadian(30) / 60;
    this.ctx.cullFace(this.ctx.FRONT);
    this.depthRenderPass();
    this.ctx.bindFramebuffer(this.ctx.FRAMEBUFFER, null);
    this.ctx.activeTexture(this.ctx.TEXTURE0);
    this.ctx.bindTexture(
      this.ctx.TEXTURE_2D,
      this.depthTexture as WebGLTexture
    );
    this.initialScene(this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.cullFace(this.ctx.BACK);
    this._defaultRenderPass();
    requestAnimationFrame(this.renderLoop.bind(this));
  }
}

let radian = 0;
