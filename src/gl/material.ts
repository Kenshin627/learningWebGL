import { vec3 } from "gl-matrix";
export class Material {
    public ambient: vec3;
    public diffuse: vec3;
    public specular: vec3;
    public shininess: number;
    private _textures: string[];
    constructor(ambinet: vec3, diffuse: vec3, specular: vec3, shininess: number) {
        this.ambient = ambinet;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this._textures = [];
    }

    get textures() {
        return this._textures;
    }

    set textures(textures: string[]) {
        this.textures.push(...textures);
    }
}