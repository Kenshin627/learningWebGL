import { glMatrix, mat4, vec3 } from "gl-matrix";

export interface cameraOptions {
    position: vec3;
    direction: vec3;
    up: vec3;
    perspective: {
        fov: number;
        aspectRatio: number;
        near: number;
        far: number;
    }
}
export class Camera {
    public viewMatrix: mat4;
    public projection: mat4;
    public position: vec3;
    public direction: vec3;
    public up: vec3;
    public nearPlane?: number;
    public farPlane?: number;
    public yaw: number = -90.0;
    public pitch: number = 0.0;
    constructor(opts?: cameraOptions) {
        this.viewMatrix = mat4.create();
        this.projection = mat4.create();
        this.position = vec3.create();
        this.direction = vec3.create();
        this.up = vec3.create();
        if (opts) {
            const { position, direction, up } = opts;
            this.position = position;
            this.direction = direction;
            this.up = up;
            mat4.lookAt(this.viewMatrix, position, direction, up)
        }
    }

    lookAt(opts: cameraOptions) {
        const { position, direction, up } = opts;
        this.position = position;
        this.direction = direction;
        this.up = up;
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

    updateCameraVectors() {
        let front = vec3.create();
        front[0] = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        front[1] = Math.sin(glMatrix.toRadian(this.pitch));
        front[2] = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        vec3.normalize(this.direction, front);
        let right = vec3.create();
        vec3.normalize(right, vec3.cross(right, front, this.up));
        vec3.normalize(this.up, vec3.cross(this.up, right, front));
        this.lookAt({
            position: this.position,
            direction: front,
            up: this.up,
            perspective: {
                fov: 0,
                aspectRatio: 0,
                near: 0,
                far: 0
            }
        })
    }
}