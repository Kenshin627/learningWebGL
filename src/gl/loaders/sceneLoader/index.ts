import 
{ 
    AccessorBase, 
    BufferViewBase, 
    BufferBase, 
    BufferViewTarget, 
    GLTF, GLTFSource, 
    MeshBase, 
    MeshPrimitiveBase, 
    BufferView 
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
            }
        }
    }

}