import { Material } from "./material";
import { Geometry } from "./geometry";

export class Mesh {
    public geometry: Geometry;
    public shader: string = "";
    public material: Material;
    constructor(geometry: Geometry, shader: string, material: Material){
        this.geometry = geometry;
        this.shader = shader;
        this.material = material;
    }
}