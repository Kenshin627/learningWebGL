import { Scene } from "../../../sceneGraph/scene";
import { Mesh } from "../../../sceneGraph/mesh";
import { TransformNode } from "../../../sceneGraph/transformNode";
import { mat4, quat, vec3 } from "gl-matrix";
export enum FileType {
    GLB,
    GLTF,
    OBJ
}

const attributes: Record<string, string> = {
    "POSITION": "a_position",
    "NORMAL": "a_normal",
    "TEXCOORD_0": "texcoord0",
    "TEXCOORD_1": "texcoord1",
    "TEXCOORD_2": "texcoord2",
}

type getLoader<T> = { [key in keyof T as T[key] extends (url: string) => any? key: never ]: any }

const LoadMap: Record<FileType, keyof getLoader<SceneLoader>> = {
    0: "glbLoader",
    1: "gltfLoader",
    2: "objLoader"
}
export class SceneLoader {
    private accessors: any;
    private bufferViews: any;
    private buffers: any;
    private images: any;
    private materials: any;
    private meshes: any;
    private nodes: any;
    private samplers: any;
    private scene: any;
    private scenes: any;
    private textures: any;

    async loadScene(type: FileType, url: string) {
        return await this[LoadMap[type]](url);
    }

    async gltfLoader(url: string) {
        const assets = await (await fetch(url)).json();
        const roots: TransformNode[] = [];
        const { accessors, bufferViews, buffers, images, materials, meshes, nodes, samplers, scene, scenes, textures } = assets;
        this.accessors = accessors;
        this.bufferViews = bufferViews;
        this.buffers = buffers;
        this.images = images;
        this.materials = materials;
        this.meshes = meshes;
        this.nodes = nodes;
        this.samplers = samplers;
        this.scene = scene;
        this.scenes = scenes;
        this.textures = textures;

        const _scene = scenes[scene];
        _scene.nodes.forEach((node: number) => {
            roots.push(this._walkNodes(nodes[node]));
        })
        return roots;
    }

    private _walkNodes(node: any): TransformNode {
        let currentTransformNode: TransformNode | Mesh;
        const matrix: [number, number, number, number,
                       number, number, number, number,
                       number, number, number, number,
                       number, number, number, number
                       ] = node.matrix;
        const translationAmount: [number, number, number] = node.translation;
        const rotationAmount: [number, number, number, number] = node.rotation;
        const scaleAmount: [number, number, number] = node.scale;
        let transform = mat4.identity(mat4.create());
        let translation = mat4.identity(mat4.create());
        let rotation = mat4.identity(mat4.create());
        let scale = mat4.identity(mat4.create());

        if (translationAmount) {
            translation = mat4.fromTranslation(translation, vec3.fromValues(...translationAmount));
        }
        if (rotationAmount) {
            rotation = mat4.fromQuat(rotation, quat.fromValues(...rotationAmount));
        }
        if (scaleAmount) {
            scale = mat4.fromScaling(scale, vec3.fromValues(...scaleAmount));
        }

        transform = mat4.multiply(transform, translation, mat4.multiply(transform, rotation, scale));

        if (matrix) {
            transform = mat4.fromValues(...matrix);
        }
        if (node.mesh !== null && node.mesh !== undefined) {
            currentTransformNode = this._createMesh(node.mesh, node.name, transform);
        }else {
            currentTransformNode = new TransformNode(node.name, transform);
        }
        if (node.children && node.children.length) {
            node.children.forEach((child: number) => {
                currentTransformNode.children.push(this._walkNodes(this.nodes[child]))
            });
        }
        return currentTransformNode;
    }
    
    private async _createMesh(index: number, name: string, transform: mat4) {
        const mesh = new Mesh(name, transform);
        const source = this.meshes[index];
        const primitives = source.primitives[0];
        const indices = primitives.indices;
        const material = primitives.material;
        const attributes: Record<string, number> = primitives.attributes;
        const baseBuffer = this.buffers;
        for (const k of Object.keys(attributes)) {
            const { bufferView, componentType, count, max, min, type } = this.accessors[attributes[k]];
            const { buffer, byteLength, byteOffset } = this.bufferViews[bufferView];
            let reader = new FileReader();
            let arraybuffer = await (await fetch(baseBuffer[buffer].uri)).arrayBuffer();
            let uini8Array = new Int8Array(arraybuffer, byteOffset, byteLength);
            
        }

        return mesh;
    }




    /**
     * 
     * @param url 
     */
    glbLoader(url: string) {}
    async objLoader(url: string) {}
}

export function _base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}