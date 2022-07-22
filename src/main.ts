import './styles/style.css';
import { Renderer, IVertices } from "./renderer";
import json from './assets/data.json';

type listType = Record<string, { buffer: IVertices, shader: string }>;
const l = json as listType;
let renderer = new Renderer(document.querySelector("#webglBox")as HTMLCanvasElement);
let d = document.querySelector(".list-ul");
d?.addEventListener("click", e => {
    const key = (e.target as any).id as string; 
    if (l[key]) {      
        const { shader, buffer } =l[key];
        renderer.compiler(shader, buffer);
    }
})
