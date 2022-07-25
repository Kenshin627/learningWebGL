import './styles/style.css';
import { Renderer, cameraOptions } from "./renderer";
import { meshes } from "./models/mesh/meshData";

let renderer = new Renderer(document.querySelector("#webglBox")as HTMLCanvasElement);
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
    if (meshes[key]) {      
        renderer.compiler(meshes[key], cameraData[key]);
    }
})
