import './styles/style.css';
import { Renderer } from "./renderer";

new Renderer(document.querySelector("#webglBox")as HTMLCanvasElement).compilerShader();