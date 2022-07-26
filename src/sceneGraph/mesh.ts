import { TransformNode } from "./transformNode";
import { mat4 } from "gl-matrix";
import { Material } from "./material";

export class Mesh extends TransformNode {
    public material: Material | null;

    constructor(name: string, localTransform?: mat4) {
        super(name, localTransform);
        this.material = null;
    }
}