import { vec3 } from "gl-matrix";
import { Nullable } from "../types";
export class Material {
    public ambient: vec3;
    public diffuse: vec3;
    public specular: vec3;
    public shininess: number;
    private _diffuseTexture: Nullable<string> = null;
    private _specularTexture: Nullable<string> = null;
    private _emmisiveTexture: Nullable<string> = null;

    constructor(ambinet: vec3, diffuse: vec3, specular: vec3, shininess: number) {
        this.ambient = ambinet;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
    }

    get diffuseTexture(): Nullable<string> {
        return this._diffuseTexture;
    }

    set diffuseTexture(texture: Nullable<string>) {
        this._diffuseTexture = texture;
    }

    get specularTexture(): Nullable<string> {
        return this._specularTexture;
    }
    set specularTexture(texture: Nullable<string>) {
        this._specularTexture = texture;
    } 
    
    get emmisiveTexture(): Nullable<string> {
        return this._emmisiveTexture;
    }
    set emmisiveTexture(texture: Nullable<string>) {
        this._emmisiveTexture = texture;
    }   
}