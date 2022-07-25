import { Mesh } from "../../gl/mesh";
import { Material } from "../../gl/material";
import { Geometry } from "../../gl/geometry";
import { vec3 } from "gl-matrix";

const defaultMaterial = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 32);

const t =  new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 64);
t.textures = ["./src/models/texture/wall.jpg"];

const c = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 32);
c.textures = ["./src/models/texture/container.jpg"];

let cubeGeo = new Geometry([
    -50, -50, -50,  0.0, 0.0, 0.0, 0.0, -1,
    50, -50, -50,  1.0, 0.0, 0.0, 0.0, -1,
    50,  50, -50,  1.0, 1.0, 0.0, 0.0, -1,
    50,  50, -50,  1.0, 1.0, 0.0, 0.0, -1,
    -50,  50, -50,  0.0, 1.0, 0.0, 0.0, -1,
    -50, -50, -50,  0.0, 0.0, 0.0, 0.0, -1,

    -50, -50,  50,  0.0, 0.0, 0.0, 0.0, 1.0,
    50, -50,  50,  1.0, 0.0, 0.0, 0.0, 1.0,
    50,  50,  50,  1.0, 1.0, 0.0, 0.0, 1.0,
    50,  50,  50,  1.0, 1.0, 0.0, 0.0, 1.0,
    -50,  50,  50,  0.0, 1.0, 0.0, 0.0, 1.0,
    -50, -50,  50,  0.0, 0.0, 0.0, 0.0, 1.0,

    -50,  50,  50,  1.0, 0.0, -1.0, 0.0, 0.0,
    -50,  50, -50,  1.0, 1.0, -1.0, 0.0, 0.0,
    -50, -50, -50,  0.0, 1.0, -1.0, 0.0, 0.0,
    -50, -50, -50,  0.0, 1.0, -1.0, 0.0, 0.0,
    -50, -50,  50,  0.0, 0.0, -1.0, 0.0, 0.0,
    -50,  50,  50,  1.0, 0.0, -1.0, 0.0, 0.0,

    50,  50,  50,  1.0, 0.0, 1.0, 0.0, 0.0,
    50,  50, -50,  1.0, 1.0, 1.0, 0.0, 0.0,
    50, -50, -50,  0.0, 1.0, 1.0, 0.0, 0.0,
    50, -50, -50,  0.0, 1.0, 1.0, 0.0, 0.0,
    50, -50,  50,  0.0, 0.0, 1.0, 0.0, 0.0,
    50,  50,  50,  1.0, 0.0, 1.0, 0.0, 0.0,

    -50, -50, -50,  0.0, 1.0, 0.0, -1.0, 0.0,
    50, -50, -50,  1.0, 1.0, 0.0, -1.0, 0.0,
    50, -50,  50,  1.0, 0.0, 0.0, -1.0, 0.0,
    50, -50,  50,  1.0, 0.0, 0.0, -1.0, 0.0,
    -50, -50,  50,  0.0, 0.0, 0.0, -1.0, 0.0,
    -50, -50, -50,  0.0, 1.0, 0.0, -1.0, 0.0,

    -50,  50, -50,  0.0, 1.0, 0.0, 1.0, 0.0,
    50,  50, -50,  1.0, 1.0, 0.0, 1.0, 0.0,
    50,  50,  50,  1.0, 0.0, 0.0, 1.0, 0.0,
    50,  50,  50,  1.0, 0.0, 0.0, 1.0, 0.0,
    -50,  50,  50,  0.0, 0.0, 0.0, 1.0, 0.0,
    -50,  50, -50,  0.0, 1.0, 0.0, 1.0, 0.0
],[
    {
        "key": "a_position",
        "size": 3,
        "offset": 0
    },
    {
        "key": "a_texcoord",
        "size": 2,
        "offset": 3
    },
    {
        "key": "a_normal",
        "size": 3,
        "offset": 5
    }
], 8, [
    {
        "key": "matrixLocation",
        "func": "uniformMatrix4fv",
        "data": ""
    }
])

export const meshes: Record<string, Mesh> = {
    "triangle": {
        geometry: new Geometry([
                
            0, 70, 0.0, 0.0, 1.0, 0.0,
            100, -100, 0.0, 0.0, 0.0, 1.0,
            -100, -100, 0.0, 1.0, 0.0, 0.0
        ], [
            {
                "key": "a_position",
                "size": 3,
                "offset": 0
            },
            {
                "key": "a_color",
                "size": 3,
                "offset": 3
            }
        ], 6, [
            {
                "key": "matrixLocation",
                "func": "uniformMatrix4fv",
                "data": ""
            }
        ]),
        shader: "./src/shaders/triangle",
        material: defaultMaterial
    },
    "texture": {
        geometry: new Geometry([
            -100, -100, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0,
            0, 70, 0.0, 0.0, 1.0,0.0, 1.0, 2.0,
            100, -100, 0.0, 0.0, 1.0, 1.0, 2.0, 0.0
        ],[
            {
                "key": "a_position",
                "size": 3,
                "offset": 0
            },
            {
                "key": "a_color",
                "size": 3,
                "offset": 3
            },
            {
                "key": "a_texcoord",
                "size": 2,
                "offset": 6
            }
        ], 8, [
            {
                "key": "matrixLocation",
                "func": "uniformMatrix4fv",
                "data": ""
            }
        ]),
        shader: "./src/shaders/texture",
        material: t
    },
    "camera": {
        geometry: cubeGeo,
        shader: "./src/shaders/camera",
        material: c
    },
    "blinnPhong": {
        geometry: cubeGeo,
        shader: "./src/shaders/blinnPhong",
        material: c
    }
}