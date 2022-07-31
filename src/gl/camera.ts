import { mat4, vec3 } from "gl-matrix";

export interface cameraOptions {
    position: vec3;
    direction: vec3;
    up: vec3;
}
export class Camera {
    public viewMatrix: mat4;
    public projection: mat4;
    public position: vec3;
    public nearPlane?: number;
    public farPlane?: number;
    constructor(opts?: cameraOptions) {
        this.viewMatrix = mat4.create();
        this.projection = mat4.create();
        this.position = vec3.create();
        if (opts) {
            const { position, direction, up } = opts;
            this.position = position;
            mat4.lookAt(this.viewMatrix, position, direction, up)
        }
    }

    lookAt(opts: cameraOptions) {
        const { position, direction, up } = opts;
        this.position = position;
        mat4.lookAt(this.viewMatrix, position, direction, up);
    }
    
    orthor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        mat4.ortho(this.projection, left,right,bottom,top, near, far);
    }

    perspective(fov: number, aspectratio: number, near: number, far: number) {
        this.nearPlane = near;
        this.farPlane = far;
        mat4.perspective(this.projection, fov, aspectratio, near, far);
    }
}