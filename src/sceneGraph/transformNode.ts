import { mat4 } from "gl-matrix";
import { Nullable } from "../types";

export class TransformNode {
    public name: string;
    public children: TransformNode[];
    public localTransform: Nullable<mat4>;
    constructor(name: string, localTransform?: mat4) {
        this.name = name;
        this.children = [];
        this.localTransform = localTransform;
    }
}