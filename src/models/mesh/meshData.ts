import { Mesh } from "../../gl/mesh";
import { Material } from "../../gl/material";
import { Geometry } from "../../gl/geometry";
import { vec3 } from "gl-matrix";

const defaultMaterial = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 32);

const t =  new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 64);
t.diffuseTexture = "./src/models/texture/wall.jpg";

const c = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 64);
c.diffuseTexture = "./src/models/texture/container.jpg";

const m = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 64);
m.diffuseTexture = "./src/models/texture/container2.png";
m.specularTexture = "./src/models/texture/container2_specular.png";

const e = new Material(vec3.fromValues(0.1, 0.1, 0.1), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 16);
e.emmisiveTexture = "./src/models/texture/matrix.jpg";
e.specularTexture = "./src/models/texture/lighting_maps_specular_color.png";

const n = new Material(vec3.fromValues(0.8, 0.8, 0.8), vec3.fromValues(0.5, 0.5, 0.5), vec3.fromValues(1.0, 1.0, 1.0), 16);
n.diffuseTexture = "./src/models/texture/brick.jpg";
n.bumpTexture = "./src/models/texture/normal_mapping_normal_map.png";
// n.bumpTexture = "./src/models/texture/normal.jpg";

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
    },
    "material": {
        geometry: cubeGeo,
        shader: "./src/shaders/material",
        material: m
    },
    "emmisive": {
        geometry: cubeGeo,
        shader: "./src/shaders/emmisive",
        material: e
    },
    "normalMap": {
        geometry: cubeGeo,
        shader: "./src/shaders/normalMap",
        material: n,
        calcTBN: true
    }
}