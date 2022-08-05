import { Material } from "./material";
import { Geometry } from "./geometry";
import { mat4 } from "gl-matrix";

export class Mesh {
    public geometry: Geometry;
    public shader: string = "";
    public material: Material;
    public calcTBN?: boolean = false;
    public modelMatrix?: mat4;
    constructor(geometry: Geometry, shader: string, material: Material, modelMatrix?: mat4){
        this.geometry = geometry;
        this.shader = shader;
        this.material = material;
        this.modelMatrix = modelMatrix? modelMatrix: mat4.create();
    }
}