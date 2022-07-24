import './styles/style.css';
import { Renderer, IVertices, cameraOptions } from "./renderer";
import json from './assets/data.json';

type listType = Record<string, { buffer: IVertices, shader: string, camera?: cameraOptions }>;
const l = json as unknown as listType;
let renderer = new Renderer(document.querySelector("#webglBox")as HTMLCanvasElement);
let d = document.querySelector(".list-ul");
d?.addEventListener("click", e => {
    const key = (e.target as any).id as string; 
    if (l[key]) {      
        const { shader, buffer, camera } =l[key];
        renderer.compiler(shader, buffer, camera);
    }
})
