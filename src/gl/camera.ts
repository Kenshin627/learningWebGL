import { mat4, vec3 } from "gl-matrix";
export class Camera {
    public lookAt: mat4;
    public projection: mat4;
    constructor(position: vec3, direction: vec3, up: vec3) {
        this.lookAt = mat4.create();
        this.projection = mat4.create();
        mat4.lookAt(this.lookAt, direction, position, up)
    }
    orthor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
        mat4.ortho(this.projection, left,right,bottom,top, near, far);
    }

    perspective(fov: number, aspectratio: number, near: number, far: number) {
        mat4.perspective(this.projection, fov, aspectratio, near, far);
    }
}