import { Material } from "./material";
import { Geometry } from "./geometry";

export class Mesh {
    public geometry: Geometry;
    public shader: string = "";
    public material: Material;
    public calcTBN?: boolean = false;
    constructor(geometry: Geometry, shader: string, material: Material){
        this.geometry = geometry;
        this.shader = shader;
        this.material = material;
    }
}