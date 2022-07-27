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
    Sampler 
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
                        }else {
                            bufferView.target = BufferViewTarget.ELEMENT_ARRAY_BUFFER;
                        }
                    }
                }
            })
        })
    }

    private postProcess(): void {
        //TODO: 推断bufferViewTarget
        this.inferBufferViewTarget();

        //TODO: MOUNT BUFFERVIEW
        if (this._glTFSource.bufferViews) {
            for (let i = 0; i < this._glTFSource.bufferViews.length; i++) {
                const bufferViewSource = this._glTFSource.bufferViews[i];
                const bufferView = new BufferView(bufferViewSource, (this.glTF.buffers as ArrayBuffer[])[this._glTFSource.bufferViews[i].buffer]);
                bufferView.createBuffer(this.context);
                bufferView.bindData(this.context);
                this.glTF.bufferViews?.push(bufferView);
            }
        }

        // TODO: Accessor
		if (this._glTFSource.accessors !== undefined) {
			for (let i = 0; i < this._glTFSource.accessors.length; i++) {
				this.glTF.accessors.push(new Accessor(this._glTFSource.accessors[i], this.glTF.bufferViews[this._glTFSource.accessors[i].bufferView as number]));
			}
		}
		// TODO: Camera
		if (this._glTFSource.cameras !== undefined) {
			for (let i = 0; i < this._glTFSource.cameras.length; i++) {
				this.glTF.cameras.push(new Camera(this._glTFSource.cameras[i]))
			}
		}
		// TODO: Material
		if (this._glTFSource.materials !== undefined) {
			for (let i = 0; i < this._glTFSource.materials.length; i++) {
				this.glTF.materials.push(new Material(this._glTFSource.materials[i]));
			}
		}
		// TODO: Sampler
		if (this._glTFSource.samplers !== undefined) {
			for (let i = 0; i < this._glTFSource.samplers.length; i++) {
				this.glTF.samplers.push(new Sampler(this._glTFSource.samplers[i]));
			}
		}
		// TODO: Texture
		if (this._glTFSource.textures !== undefined) {
			for (let i = 0; i < this._glTFSource.textures.length; i++) {
				this.glTF.textures.push(new Texture(this._glTFSource.textures[i], this));
				this.glTF.textures[i].createTexture(this.context);
			}
		}
		// TODO: Mesh
		if (this._glTFSource.meshes !== undefined) {
			for (let i = 0; i < this._glTFSource.meshes.length; i++) {
				this.glTF.meshes.push(new Mesh(this._glTFSource.meshes[i], i, this));
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

        const loadImage: Promise<boolean> = new Promise<boolean>(async(resolve) => {
            if (this._glTFSource.images) {
                const ImagePromise: Promise<ImageBitmap>[] = [];
                for (const imageInfo of this._glTFSource.images) {
                    try {
                        ImagePromise.push(fetch(imageInfo.uri as string).then((response: Response) => {
                            if (response.ok) {
                                return response.blob();
                            }
                            throw new Error("loading Error: Error ocured in loading images.");
                            
                        }).then((blob: Blob) => {
                            return createImageBitmap(blob);
                        }))
                    } catch (error) {
                        console.error(error);
                    }
                }

                for (const [imageID, imagePending] of ImagePromise.entries()) {
                    this.glTF.images[imageID] = await imagePending;
                }
            }
            resolve(true);
        });

        await loadBuffer;
        await loadImage;
        this.postProcess();
        return this.glTF;
    }

}