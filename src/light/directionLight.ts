import { vec3 } from "gl-matrix";
import { Light } from "./baseLight";

export class DirectionLight extends Light {
    public direction: vec3;
    constructor(color: vec3, direction: vec3, position: vec3,intensity: number) {
        super(position, color, intensity);
        this.direction =direction;
    }
}