import './styles/style.css';
import { Renderer } from "./renderer";
import { Renderer as Renderer2 } from './renderer/index';
import { meshes } from "./models/mesh/meshData";
import { GLTFLoader } from "./gl/loaders/sceneLoader/index";
import { cameraOptions } from './gl/camera';

const container = document.querySelector("#webglBox")as HTMLCanvasElement;
let renderer = new Renderer(container);
let glOpts: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    stencil: true
};
const _gl = container.getContext("webgl2", glOpts) as WebGL2RenderingContext;

let loader = new GLTFLoader(_gl);;

let d = document.querySelector(".list-ul");
let cameraData: Record<string, cameraOptions> = {
    "camera": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0]
    },
    "blinnPhong": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0]
    },
    "material": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0]
    },
    "emmisive": {
        "position": [100, 100, -200],
        "direction": [0, 0, -1],
        "up": [0, 1, 0]
    }
}
d?.addEventListener("click", e => {
    const key = (e.target as any).id as string; 
    if (key === "gltfLoader") {
        loader.loadGLTF("./src/models/gltf/shadowBox2.gltf").then(gltf => {
            let renderer2 = new Renderer2(_gl, gltf);
            renderer2.setupScene().then(() => {
                renderer2.renderLoop();
            })
        })
    }else {
        if (meshes[key]) {
            renderer.compiler(meshes[key], cameraData[key]);
        }
    }
})
