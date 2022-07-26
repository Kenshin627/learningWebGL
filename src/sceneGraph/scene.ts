import { TransformNode } from "./transformNode";
import { mat4 } from "gl-matrix";

export class Scene {
    public name: string;
    public nodes: TransformNode[];
    constructor(name: string, nodes: TransformNode[]) {
        this.name = name;
        this.nodes = nodes;
    }
}