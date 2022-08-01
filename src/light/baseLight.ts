import { vec3 } from "gl-matrix";

export class Light {
    public position: vec3;
    public intensity: number;
    public color: vec3;
    constructor(position: vec3, color: vec3, intensity: number) {
        this.position = position;
        this.color = color;
        this.intensity = intensity;
    }
}