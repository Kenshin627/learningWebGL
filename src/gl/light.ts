import { vec3 } from "gl-matrix";

export class Light {
    public color: vec3;
    public intensity: number;
    // public ambient: number;
    // public position: vec3;
    public direction: vec3;
    constructor(color: vec3, direction: vec3, intensity: number) {
        this.color = color;
        // this.position = position;
        this.direction =direction;
        this.intensity =intensity;
        // this.ambient = ambient;
    }
}