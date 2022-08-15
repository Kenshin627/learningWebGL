import './styles/style.css';
import { Renderer } from "./renderer";
import { Renderer as Renderer2 } from './renderer/index';
import { meshes } from "./models/mesh/meshData";
import { GLTFLoader } from "./gl/loaders/sceneLoader/index";
import { cameraOptions } from './gl/camera';
import { glMatrix } from 'gl-matrix';
import { bloom } from './bloom';
import { PBR } from './pbr';

const container = document.querySelector("#webglBox")as HTMLCanvasElement;
let renderer = new Renderer(container);
let glOpts: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: true
};

const _gl = container.getContext("webgl2", glOpts) as WebGL2RenderingContext;

// glMatrix.toRadian(60), this._gl.canvas.width / this._gl.canvas.height, 1, 1000
const perspective = {
    fov: glMatrix.toRadian(60),
    aspectRatio: _gl.canvas.width / _gl.canvas.height,
    near: 1,
    far: 1000
}

let loader = new GLTFLoader(_gl);;

let d = document.querySelector(".list-ul");
let cameraData: Record<string, cameraOptions> = {
    "camera": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "blinnPhong": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "material": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "emmisive": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "normalMap": {
        "position": [0, 0, -150],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "frameBuffer": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective
    },
    "hdr": {
        "position": [0, 0, 5],
        "direction": [0, 0, -1],
        "up": [0, 1, 0],
        perspective: {
            fov: glMatrix.toRadian(45),
            aspectRatio: _gl.canvas.width / _gl.canvas.height,
            near: 0.1,
            far: 100
        }
    },
    "bloom": {
        "position": [4.0, 2.0, 5.0],
        "direction": [-1.0, 0, -1.0],
        "up": [0, 1, 0],
        perspective: {
            fov: glMatrix.toRadian(45),
            aspectRatio: _gl.canvas.width / _gl.canvas.height,
            near: 0.1,
            far: 100.0
        }
    }
}
d?.addEventListener("click", async (e) => {
    const key = (e.target as any).id as string; 
    if (key === "gltfLoader") {
        loader.loadGLTF("./src/models/gltf/shadowBox2.gltf").then(gltf => {
            let renderer2 = new Renderer2(_gl, gltf);
            renderer2.setupScene().then(() => {
                renderer2.renderLoop();
            })
        })
    }
    else if(key === "bloom") {
        let bloom1 = new bloom(meshes[key], cameraData[key], _gl);
        await bloom1.setupScene();
        bloom1.renderLoop();
    }
    else if(key === "pbr") {
        let pbr = new PBR(_gl, {
            "position": [0, 0, 10],
            "direction" : [0, 0, -1],
            "up": [0, 1, 0],
            perspective: {
                fov: glMatrix.toRadian(45),
                aspectRatio: _gl.canvas.width / _gl.canvas.height,
                near: 0.1,
                far: 100.0
            }
        });
        await pbr.setupScene();
        pbr.renderLoop();
    }
    else {
        if (meshes[key]) {
            renderer.compiler(key, meshes[key], cameraData[key]);
        }
    }
})
