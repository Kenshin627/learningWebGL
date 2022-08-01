import { vec3 } from "gl-matrix";
import { Light } from "./baseLight";

export class PointLight extends Light {
    constructor(position: vec3, color: vec3, intensity: number) {
        super(position, color, intensity);
    }
}