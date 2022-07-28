import { mat4, vec3 } from "gl-matrix";
import { meshes } from "../../../models/mesh/meshData";
import { getAABBFromOBB } from "../../../utils";
import 
{ 
    AccessorBase, 
    BufferViewBase, 
    BufferViewTarget, 
    GLTF, GLTFSource, 
    MeshBase, 
    MeshPrimitiveBase, 
    BufferView,
    Accessor,
    Material,
    Mesh,
    Texture,
    Camera,
    Node,
    Sampler, 
    NodeBase,
    SceneBase,
    Scene,
    BoundingBox,
    Skin,
    Animation
} 
from "./gltftypes";

export class GLTFLoader {
    //@ts-ignore
    _glTFSource: GLTFSource;
    //@ts-ignore
    glTF: GLTF;
    baseUri?: string;
    enableGLAvatar: boolean;
    //@ts-ignore
    skeletonGLTF: GLTF;
    context: WebGL2RenderingContext;
    constructor(ctx: WebGL2RenderingContext) {
        this.enableGLAvatar = false;
        this.context = ctx;
    }

    public getBaseUri(uri: string): string {
        let basePath: string = "";
        let i = uri.lastIndexOf('/');
        if (i !== -1) {
            basePath = uri.substring(0, i + 1);
        }
        return basePath;
    }

    private inferBufferViewTarget(): void {
        const ATTRIBUTES = ["POSITION", "NORMAL", "TEXCOORD_0"];
        this._glTFSource.meshes?.forEach((mesh: MeshBase) => {
            mesh.primitives.forEach((primitive: MeshPrimitiveBase) => {
                for (const [attributeName, accessorIndex] of Object.entries(primitive.attributes)) {
                    if (ATTRIBUTES.includes(attributeName)) {
                        let accecssor = (this._glTFSource.accessors as AccessorBase[])[accessorIndex];
                        (this._glTFSource.bufferViews as BufferViewBase[])[accecssor.bufferView as number].target = BufferViewTarget.ARRAY_BUFFER;
                    }
                }
                if (primitive.indices !== undefined) {
                    const bufferView = (this._glTFSource.bufferViews as BufferViewBase[])[(this._glTFSource.accessors as AccessorBase[])[primitive.indices as number].bufferView as number];
                    if (bufferView.target !== undefined) {
                        if (bufferView.target !== BufferViewTarget.ELEMENT_ARRAY_BUFFER) {
                            console.warn("BufferView " + primitive.indices + " should have a target equal to ELEMENT_ARRAY_BUFFER");
                        }
                    }else {
                        bufferView.target = BufferViewTarget.ELEMENT_ARRAY_BUFFER;
                    }
                }
            })
        })
    }

    private postProcess(): void {
        //TODO: 推断bufferViewTarget
        this.inferBufferViewTarget();

        //TODO: MOUNT BUFFERVIEW
        if (this._glTFSource.bufferViews && this._glTFSource.bufferViews.length) {
            for (let i = 0; i < this._glTFSource.bufferViews.length; i++) {
                const bufferViewSource = this._glTFSource.bufferViews[i];
                const bufferView = new BufferView(bufferViewSource, (this.glTF.buffers as ArrayBuffer[])[this._glTFSource.bufferViews[i].buffer]);
                bufferView.createBuffer(this.context);
                bufferView.bindData(this.context);
                this.glTF.bufferViews?.push(bufferView);
            }
        }

        // TODO: Accessor
		if (this._glTFSource.accessors && this._glTFSource.accessors.length) {
			for (let i = 0; i < this._glTFSource.accessors.length; i++) {
				this.glTF.accessors.push(new Accessor(this._glTFSource.accessors[i], this.glTF.bufferViews[this._glTFSource.accessors[i].bufferView as number]));
			}
		}
		// TODO: Camera
		if (this._glTFSource.cameras && this._glTFSource.cameras.length) {
			for (let i = 0; i < this._glTFSource.cameras.length; i++) {
				this.glTF.cameras.push(new Camera(this._glTFSource.cameras[i]))
			}
		}
		// TODO: Material
		if (this._glTFSource.materials && this._glTFSource.materials.length) {
			for (let i = 0; i < this._glTFSource.materials.length; i++) {
				this.glTF.materials.push(new Material(this._glTFSource.materials[i]));
			}
		}
		// TODO: Sampler
		if (this._glTFSource.samplers && this._glTFSource.samplers.length) {
			for (let i = 0; i < this._glTFSource.samplers.length; i++) {
				this.glTF.samplers.push(new Sampler(this._glTFSource.samplers[i]));
			}
		}
		// // TODO: Texture
		// if (this._glTFSource.textures && this._glTFSource.textures.length) {
		// 	for (let i = 0; i < this._glTFSource.textures.length; i++) {
		// 		this.glTF.textures.push(new Texture(this._glTFSource.textures[i], this));
		// 		this.glTF.textures[i].createTexture(this.context);
		// 	}
		// }
		// TODO: Mesh
		if (this._glTFSource.meshes && this._glTFSource.meshes.length) {
			for (let i = 0; i < this._glTFSource.meshes.length; i++) {
				this.glTF.meshes.push(new Mesh(this._glTFSource.meshes[i], i, this));
			}
		}

        //TODO: Node
        if (this._glTFSource.nodes && this._glTFSource.nodes.length) {
            this._glTFSource.nodes.forEach((node: NodeBase, idx: number) => {
                this.glTF.nodes.push(new Node(node, idx, this));
            })
            this.glTF.nodes.forEach((node: Node) => {
                node.childrenID.forEach((childId: number, idx: number) => {
                    node.children[idx] = this.glTF.nodes[childId];
                    node.children[idx].parent = node;
                })
            })
        }

        //TODO: Scene
        if (this._glTFSource.scenes && this._glTFSource.scenes.length) {
            this._glTFSource.scenes.forEach((scene: SceneBase, idx: number) =>{
                const _scene = new Scene(scene, this.glTF);
                _scene.boundingBox = new BoundingBox();
                this.glTF.scenes[idx] = _scene;
                const nodeMatrices: Record<number, mat4> = {};
                _scene.nodes.forEach((node: Node) => {
                    node.traverseTwoFunction((node: Node, parent?: Node) =>{
                        if (parent) {
                            let nodeMatrix = mat4.create();
                            mat4.multiply(nodeMatrix, nodeMatrices[parent.nodeID], node.modelMatrix)
                            nodeMatrices[node.nodeID] = nodeMatrix;
                        }else {
                            nodeMatrices[node.nodeID] = mat4.clone(node.modelMatrix);
                        }
                    },
                    (node: Node, parent?: Node)=>{
                        if (node.mesh) {
                            node.worldMatrix = mat4.clone(nodeMatrices[node.nodeID]);
                            node.mesh.modelMatrix = node.worldMatrix;
                            if (node.mesh.boundingBox) {
                                node.aabb = getAABBFromOBB(node.mesh.boundingBox, node.worldMatrix);
                                if (node.children.length === 0) {
                                    node.bvh.min = vec3.clone(node.aabb.min);
                                    node.bvh.max = vec3.clone(node.aabb.max);
                                }
                            }
                        }
                        if (node.camera !== null && node.camera !== undefined) {
                            node.worldMatrix = mat4.clone(nodeMatrices[node.nodeID]);
                            this.glTF.cameras[node.camera].lookAt = node.worldMatrix;
                        }
                        if (parent) {
                            parent.bvh.min = vec3.min(parent.bvh.min, parent.bvh.min, node.bvh.min);
                            parent.bvh.max = vec3.max(parent.bvh.max, parent.bvh.max, node.bvh.max);
                        }else {
                            vec3.min((_scene.boundingBox as BoundingBox).min, (_scene.boundingBox as BoundingBox).min, node.bvh.min);
                            vec3.max((_scene.boundingBox as BoundingBox).max, (_scene.boundingBox as BoundingBox).max, node.bvh.max);
                        }
                    })
                })
                _scene.boundingBox.calculateTransform();
            })
            if (this._glTFSource.scene) {
                this.glTF.scene = this.glTF.scenes[this._glTFSource.scene];
            }else {
                this.glTF.scene = this.glTF.scenes[0];
            }
            this.glTF.nodes.forEach(node => {
                if (node.bvh) {
                    node.bvh.calculateTransform();
                }
            })
        }

        //TODO: Animation
		if (this._glTFSource.animations) {
			for (let i = 0; i < this._glTFSource.animations.length; i++) {
				this.glTF.animations.push(new Animation(this._glTFSource.animations[i], this.glTF));
				this.glTF.animations[i].channels.forEach((channel) => {
					channel.target.node = this.glTF.nodes[channel.target.nodeID as number];
				})
			}
		}
		//TODO: Skin
		if (this._glTFSource.skins) {
			for (let i = 0; i < this._glTFSource.skins.length; i++) {
				this.glTF.skins.push(new Skin(this._glTFSource.skins[i], this.glTF));
			}
			for (let i = 0; i < this.glTF.nodes.length; i++) {
				if (this.glTF.nodes[i].skin !== null) {
					if (typeof (this._glTFSource.nodes as NodeBase[])[this.glTF.nodes[i].nodeID].skin) {
						// usual skin, hook up
						this.glTF.nodes[i].skin = this.glTF.skins[(this._glTFSource.nodes as NodeBase[])[this.glTF.nodes[i].nodeID].skin as number];
					} else {
						// assume gl_avatar is in use then do nothing
					}
				}
			}
		}
    }

    public async loadGLTF(uri: string): Promise<GLTF> {
        this.baseUri = this.getBaseUri(uri);
        try {
            const gltfBase:GLTFSource = await fetch(uri).then((response: Response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("loading Error: Error occured in loading glTF JSON.");
            })
            this._glTFSource = gltfBase;
            this.glTF = new GLTF(this._glTFSource);
        } catch (error) {
            throw new Error(`${error}`);
        }
        const loadBuffer: Promise<boolean> = new Promise<boolean>(async (resolve) => {
            if (this._glTFSource.buffers) {
                const bufferPromise: Promise<ArrayBuffer>[] = []
                for (const bufferInfo of this._glTFSource.buffers) {
                    try {
                        bufferPromise.push(fetch(bufferInfo.uri as string).then((response: Response) => {
                            if (response.ok) {
                                return response.arrayBuffer();
                            }
                            throw new Error(`loadingError: Error ocured in loading buffers.`)
                        }))
                    } catch (error) {
                        console.error(error);
                    }
                }
                for (const [bufferID, bufferPending] of bufferPromise.entries()) {
                    this.glTF.buffers[bufferID] = await bufferPending;
                }
            }
            resolve(true);
        })

        // const loadImage: Promise<boolean> = new Promise<boolean>(async(resolve) => {
        //     if (this._glTFSource.images) {
        //         const ImagePromise: Promise<ImageBitmap>[] = [];
        //         for (const imageInfo of this._glTFSource.images) {
        //             try {
        //                 ImagePromise.push(fetch(this.glTF.bufferViews[imageInfo.bufferView as number]).then((response: Response) => {
        //                     if (response.ok) {
        //                         return response.blob();
        //                     }
        //                     throw new Error("loading Error: Error ocured in loading images.");
                            
        //                 }).then((blob: Blob) => {
        //                     return createImageBitmap(blob);
        //                 }))
        //             } catch (error) {
        //                 console.error(error);
        //             }
        //         }

        //         for (const [imageID, imagePending] of ImagePromise.entries()) {
        //             this.glTF.images[imageID] = await imagePending;
        //         }
        //     }
        //     resolve(true);
        // });

        await loadBuffer;
        // await loadImage;
        this.postProcess();
        return this.glTF;
    }
}