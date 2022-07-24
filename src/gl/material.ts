import { vec3 } from "gl-matrix";
export class Material {
    public ambient: vec3;
    public diffuse: vec3;
    public specular: vec3;
    public shininess: number;
    constructor(ambinet: vec3, diffuse: vec3, specular: vec3, shininess: number) {
        this.ambient = ambinet;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }
}