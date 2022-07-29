import { vec3, mat4, quat } from 'gl-matrix';
import { 
    AccessorComponentType, 
    AccessorSparseBase, 
    AccessorBase, 
    SceneBase, 
    BufferViewTarget, 
    BufferViewBase,
    CameraOrthographicBase,
    CameraPerspectiveBase,
    CameraBase,
    GLTFID,
    NodeBase,
    MeshBase,
    MeshPrimitiveBase,
    MeshPrimitiveType,
    TextureBase,
    SamplerMagnificationFilter,
    SamplerMinificationFilter,
    SamplerWrappingMode,
    SamplerBase,
    TextureInfoBase,
    MaterialBase,
    MaterialPbrMetallicRoughnessBase,
    MaterialNormalTextureInfoBase,
    MaterialOcclusionTextureInfoBase,
    SkinBase,
    AnimationBase,
    AnimationChannelBase,
    AnimationChannelTargetBase,
    AnimationSamplerBase,
    AssetBase,
    GLTFSource

} from './gltftypes';
import { glTFLoaderBasic } from './utils';
import { GLTFLoader } from '.';
import { Shader } from '../../shader';
//GLTF

export class Scene {
	nodes		:  Node[];
	name?		:  string | null;
	extensions	:  any;
	extras		:  any;
	boundingBox?:  BoundingBox;
	constructor (sceneBase: SceneBase, gltf: GLTF) {
		const length = sceneBase.nodes.length;
		this.nodes = [];
		for (let i = 0; i < length; i++) {
			this.nodes.push(gltf.nodes[sceneBase.nodes[i]]);
		}
		this.name			= sceneBase.name;
		this.extensions		= sceneBase.extensions;
		this.extras			= sceneBase.extras;
	};
};

export interface BoundingBoxBase {
	min			:  vec3;
	max			:  vec3;
	transform	:  mat4;
}
export class BoundingBox {
	min			:  vec3;
	max			:  vec3;
    center      :  vec3;
	transform	:  mat4;
	constructor(min?: vec3, max?: vec3, isClone?: boolean) {
        this.center = vec3.create();
        if (min && max) {
            vec3.add(this.center, min, max);
            vec3.scale(this.center, this.center, 0.5);
        }
		min = min || vec3.fromValues(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
		max = max || vec3.fromValues(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        
		if (isClone === undefined || isClone === true) {
			this.min = vec3.clone(min);
			this.max = vec3.clone(max);
		} else {
			this.min = min;
			this.max = max;
		}
		this.transform = mat4.create();
	};
	updateBoundingBox(boundingBoxBase: BoundingBoxBase): void {
		vec3.min(this.min, this.min, boundingBoxBase.min);
		vec3.max(this.max, this.max, boundingBoxBase.max);
        vec3.add(this.center, this.min, this.max);
        vec3.scale(this.center, this.center, 0.5);
	};
	calculateTransform(): void {
		// transform from a unit cube whose min = (0, 0, 0) and max = (1, 1, 1)
		// scale
		this.transform[0]	= this.max[0] - this.min[0];
		this.transform[5]	= this.max[1] - this.min[1];
		this.transform[10]	= this.max[2] - this.min[2];
		// translate
		this.transform[12]	= this.min[0];
		this.transform[13]	= this.min[1];
		this.transform[14]	= this.min[2];
	};
}
export class Accessor {
	bufferView		:  BufferView;
	byteOffset		:  number;
	componentType	:  AccessorComponentType;
	normalized		:  boolean;
	count			:  number;
	type			:  "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
	max?				:  number[];
	min?			:  number[];
	sparse?			:  AccessorSparseBase;
	name?			:  string;
	extensions		:  any;
	extras			:  any;
	constructor(accessorBase: AccessorBase, bufferView: BufferView) {
		this.bufferView 	=  bufferView;
		this.byteOffset		=  accessorBase.byteOffset !== undefined? accessorBase.byteOffset : 0;
		this.componentType	=  accessorBase.componentType;
		this.normalized		=  accessorBase.normalized !== undefined? accessorBase.normalized : false;
		this.count			=  accessorBase.count;
		this.type			=  accessorBase.type;
		this.max			=  accessorBase.max;
		this.min			=  accessorBase.min;
		this.sparse			=  accessorBase.sparse;
		this.name			=  accessorBase.name;
		this.extensions		=  accessorBase.extensions;
		this.extras			=  accessorBase.extras;
	}
	prepareVertexAttribute(gl: WebGL2RenderingContext, location: number): void {
		gl.vertexAttribPointer(
			location,
			glTFLoaderBasic.accessorTypeToNumComponents(this.type),
			this.componentType,
			this.normalized,
			this.bufferView.byteStride,
			this.byteOffset
		)
		gl.enableVertexAttribArray(location)
	}
}
export class BufferView {
	buffer?		:  WebGLBuffer;
	byteOffset	:  number;
	byteLength	:  number;
	byteStride	:  number;
	target		:  BufferViewTarget;
	name?		:  string;
	extensions	:  any;
	extras		:  any;
	data		:  ArrayBuffer;
	constructor(bufferViewBase: BufferViewBase, bufferData: ArrayBuffer) {
		this.byteOffset = bufferViewBase.byteOffset !== undefined? bufferViewBase.byteOffset : 0;
		this.byteLength = bufferViewBase.byteLength;
		this.byteStride = bufferViewBase.byteStride	!== undefined? bufferViewBase.byteStride : 0;
		this.target		= bufferViewBase.target !== undefined? bufferViewBase.target : 0;
		this.name		= bufferViewBase.name;
		this.extensions	= bufferViewBase.extensions;
		this.extras		= bufferViewBase.extras;
		this.data		= bufferData.slice(this.byteOffset, this.byteOffset + this.byteLength);
	}
	createBuffer(gl: WebGL2RenderingContext): void {
		this.buffer = gl.createBuffer() as WebGLBuffer;
	}
	bindData(gl:WebGL2RenderingContext): void {
		const target = this.target || BufferViewTarget.ARRAY_BUFFER
		gl.bindBuffer(target, this.buffer as WebGLBuffer);
		gl.bufferData(target, this.data, gl.STATIC_DRAW);
		gl.bindBuffer(target, null);
	}
}
export class Camera {
	orthographic?	:  CameraOrthographicBase;
	perspective?	:  CameraPerspectiveBase
	type			:  "perspective" | "orthographic";
	name?			:  string;
	extensions		:  any;
	extras			:  any;
	lookAt 			:  mat4;
	constructor(cameraBase: CameraBase) {
		this.orthographic	= cameraBase.orthographic;
		this.perspective	= cameraBase.perspective;
		this.type 			=  cameraBase.type;
		this.name			= cameraBase.name
		this.extensions		= cameraBase.extensions;
		this.extras			= cameraBase.extras;
		this.lookAt			= mat4.create();
	}
}
export class Node {
	camera?		:  GLTFID;
	children	:  Node[];
	skin?		:  Skin;
	translation	:  vec3;
	rotation	:  quat;
	scale		:  vec3;
	matrix		:  mat4;
	mesh?		:  Mesh;
	weights?	:  number[];
	name?		:  string;
	extensions	:  any;
	extras		:  any;
	nodeID		:  GLTFID;
	childrenID	:  GLTFID[];
	parent?		:  Node;	
	skinLink?	:  SkinLink;
	modelMatrix	:  mat4;
	worldMatrix	:  mat4;
	aabb?		:  BoundingBox;
	bvh			:  BoundingBox;
	constructor(nodeBase: NodeBase, nodeID: GLTFID, currentLoader: GLTFLoader) {
		this.camera			= nodeBase.camera;
		this.children		=  [];
		this.translation	= nodeBase.translation? nodeBase.translation	: vec3.create();
		this.rotation		= nodeBase.rotation? nodeBase.rotation		: quat.create();
		this.scale			= nodeBase.scale? nodeBase.scale			: vec3.fromValues(1.0, 1.0, 1.0);
		this.matrix			= nodeBase.matrix? mat4.clone(nodeBase.matrix) : mat4.fromRotationTranslationScale(mat4.create(), this.rotation, this.translation, this.scale);
		this.mesh			= nodeBase.mesh !== null && nodeBase.mesh !== undefined? (currentLoader.glTF?.meshes as Mesh[])[nodeBase.mesh] : undefined;
		this.weights		= nodeBase.weights;
		this.name			= nodeBase.name;
		this.extensions		= nodeBase.extensions;
		this.extras			= nodeBase.extras;
		this.nodeID			= nodeID;
		this.childrenID		= nodeBase.children? nodeBase.children : [];
		this.modelMatrix	=  mat4.clone(this.matrix);
		this.worldMatrix	=  mat4.clone(this.matrix);
		if (nodeBase.extensions !== undefined) {
			if (nodeBase.extensions.gl_avatar !== undefined && currentLoader.enableGLAvatar === true) {
				const linkedSkinID 	: number	= currentLoader._glTFSource.extensions.gl_avatar.skins[nodeBase.extensions.gl_avatar.skin.name];
				const linkedSkin	: Skin		= (currentLoader.skeletonGLTF.skins as Skin[] | SkinLink[])[linkedSkinID];
				this.skinLink = new SkinLink(linkedSkin, currentLoader.glTF, nodeBase.extensions.gl_avatar.skin.inverseBindMatrices);
			}
		}
		this.bvh			= new BoundingBox();
	};
	traverse(traverseFunction: Function, parent?: Node): void {
		traverseFunction(this, parent);
		for (let i = 0, len = this.children.length; i < len; i++) {
			this.children[i].traverse(traverseFunction, this);
		}
	};
	traversePostOrder(traverseFunction: Function, parent: Node): void {
		for (var i = 0, len = this.children.length; i < len; i++) {
			this.children[i].traversePostOrder(traverseFunction, this);
		}
		traverseFunction(this, parent);
	};
	traverseTwoFunction(traverseFunctionPreOrder: Function, traverseFunctionPostOrder: Function, parent?: Node): void {
		traverseFunctionPreOrder(this, parent);
		for (let i = 0, len = this.children.length; i < len; i++) {
			this.children[i].traverseTwoFunction(traverseFunctionPreOrder, traverseFunctionPostOrder, this);
		}
		traverseFunctionPostOrder(this, parent);
	};
}
export class Mesh {
	primitives	:  MeshPrimitive[];
	weights?	:  number[];
	name?		:  string;
	extensions?	:  any;
	extras?		:  any;
	boundingBox?:  BoundingBox;
	meshID		:  number;
	modelMatrix?: mat4;
	constructor(meshBase: MeshBase, meshID: number, currentLoader: GLTFLoader) {
		this.primitives		=  [];
		this.weights		= meshBase.weights;
		this.name			= meshBase.name;
		this.extensions		= meshBase.extensions;
		this.extras			= meshBase.extras;
		let  primitiveBase : MeshPrimitiveBase, primitive : MeshPrimitive;
		for (let i = 0; i < meshBase.primitives.length; i++) {
			primitiveBase = meshBase.primitives[i];
			primitive = new MeshPrimitive(primitiveBase, currentLoader.glTF, currentLoader);
			this.primitives.push(primitive);
			if (primitive.boundingBox) {
				if (!this.boundingBox) {
					this.boundingBox = new BoundingBox()
				}
				this.boundingBox.updateBoundingBox(primitive.boundingBox);
			}
		}
		if (this.boundingBox) {
			this.boundingBox.calculateTransform();
		}
		this.meshID			=  meshID;
	}
}

export type attribute = "POSITION" | "NORMAL" | "TEXCOORD_0" | string;
type attributeId  = { [ k in attribute ]?: GLTFID };
export type arrtibuteType = { [ k in attribute ]?: Accessor };

type targets = "POSITION" | "NORMAL" | "TANGENT" | string;
type targetsId = { [ k in targets ]?: GLTFID };
type targetType = { [ k in targets ]?: Accessor };
export class MeshPrimitive {
	attributesID			: attributeId;
	attributes				: arrtibuteType;
	indicesID?				: GLTFID;
    indices?				: Accessor;
	material?				: Material;
	mode					: MeshPrimitiveType;
	targetsID?				: targetsId[];
	targets?				: targetType[];
	extensions				:  any;
	extras					:  any;
	drawIndices?			:  Accessor;
	vertexArray?			:  WebGLVertexArrayObject;
	vertexBuffer?			:  ArrayBuffer;
	shader?					:  Shader;
	boundingBox?			:  BoundingBox;
	constructor(primitiveBase: MeshPrimitiveBase, gltf: GLTF, currentLoader: GLTFLoader) {
		this.attributesID =  primitiveBase.attributes;
		if (primitiveBase.extensions !== undefined) {
			if (primitiveBase.extensions.gl_avatar !== undefined && currentLoader.enableGLAvatar === true) {
				if (primitiveBase.extensions.gl_avatar.attributes) {
					for (let attributeName in primitiveBase.extensions.gl_avatar.attributes) {
						this.attributesID[attributeName] = primitiveBase.extensions.gl_avatar.attributeName[attributeName];
					}
				}
			}
		}
		this.attributes = {};
		for (let attributeName in this.attributesID) {
			this.attributes[attributeName] = (gltf.accessors as Accessor[])[this.attributesID[attributeName] as GLTFID];
		}
		if (this.attributes.POSITION !== undefined) {
			let accessor = this.attributes.POSITION as Accessor;
			if (accessor.max) {
				if (accessor.type === "VEC3") {
                    const [ min_x, min_y, min_z ]  = accessor.min as vec3;
                    const [ max_x, max_y, max_z ] = accessor.max as vec3;
					this.boundingBox = new BoundingBox(
						vec3.fromValues(min_x, min_y, min_z ),
						vec3.fromValues(max_x, max_y, max_z),
						false
					);
					this.boundingBox.calculateTransform();
				}
			}
		}

		this.indicesID	= primitiveBase.indices;
		if (this.indicesID !== null && this.indicesID != undefined) {
			this.indices		= (gltf.accessors as Accessor[])[this.indicesID];
		} else {
			this.drawIndices	= (gltf.accessors as Accessor[])[this.attributesID.POSITION as GLTFID];
		}

		this.material	= (primitiveBase.material !== undefined) ? (gltf.materials as Material[])[primitiveBase.material] : undefined;
		this.mode		= (primitiveBase.mode !== undefined) ? primitiveBase.mode			: MeshPrimitiveType.TRIANGLES;
		this.targetsID	= primitiveBase.targets;
		// for (let targetID in this.targetsID) {
		// 	const currentTarget = {POSITION : null , NORMAL : null, TEXCOORD_0 : null};
		// 	// for (let attributeName in targetID) {
		// 	// 	this.targets
		// 	// }
		// }
		this.extensions	= (primitiveBase.extensions	!== undefined) ? primitiveBase.extensions	: null;
		this.extras		= (primitiveBase.extras		!== undefined) ? primitiveBase.extras		: null;
	}
}
export class Texture {
	sampler?	:  Sampler;
	source?		:  ImageBitmap | ImageData | HTMLImageElement;
	name?		:  string;
	extensions	:  any;
	extras		:  any;
	texture?	:  WebGLTexture;
	constructor(textureBase: TextureBase, currentLoader: GLTFLoader) {
		this.sampler	= (textureBase.sampler		!== undefined) ? (currentLoader.glTF.samplers as Sampler[])[textureBase.sampler]	: undefined;
		this.source		= (textureBase.sampler		!== undefined) ? (currentLoader.glTF.images as (ImageBitmap | ImageData | HTMLImageElement)[])[textureBase.source as number]		: undefined;
		this.name		= textureBase.name;
		this.extensions	= textureBase.extensions;
		this.extras		= textureBase.extras;
	}
	createTexture(gl: WebGL2RenderingContext): void {
		this.texture = gl.createTexture() as WebGLTexture;
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
		gl.texImage2D(
			gl.TEXTURE_2D,		// assumed
			0,					// Level of details
			gl.RGBA,			// Internalformat
			gl.RGBA,			// Format
			gl.UNSIGNED_BYTE,	// Size of each channel
			this.source as ImageBitmap | ImageData | HTMLImageElement
		);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
}
export class Sampler {
	magFilter?	:  SamplerMagnificationFilter;
	minFilter?	:  SamplerMinificationFilter;
	wrapS		:  SamplerWrappingMode;
	wrapT		:  SamplerWrappingMode;
	name?		:  string;
	extensions	:  any;
	extras		:  any;
	sampler?	:  WebGLSampler;
	constructor(samplerBase: SamplerBase) {
		this.magFilter	= samplerBase.magFilter;
		this.minFilter	= samplerBase.minFilter;
		this.wrapS		= samplerBase.wrapS !== undefined? samplerBase.wrapS : SamplerWrappingMode.REPEAT;
		this.wrapT		= samplerBase.wrapT !== undefined? samplerBase.wrapT : SamplerWrappingMode.REPEAT;
		this.name		= samplerBase.name;
		this.extensions	= samplerBase.extensions;
		this.extras		= samplerBase.extras;
	}
	createSampler(gl: WebGL2RenderingContext) {
		this.sampler = gl.createSampler() as WebGLSampler;
		if (this.minFilter) {
			gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, this.minFilter);
		} else {
			gl.samplerParameteri(this.sampler, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
		}
		if (this.magFilter) {
			gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, this.magFilter);
		} else {
			gl.samplerParameteri(this.sampler, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		}
		gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_S, this.wrapS);
		gl.samplerParameteri(this.sampler, gl.TEXTURE_WRAP_T, this.wrapT);
	}
}
export class TextureInfo {
	index		:  GLTFID;
	texCoord	:  number;
	extensions	:  any;
	extras		:  any;
	constructor(textureInfoBase: TextureInfoBase) {
		this.index		= textureInfoBase.index;
		this.texCoord	= (textureInfoBase.texCoord		!== undefined) ? textureInfoBase.texCoord	: 0 ;
		this.extensions	= (textureInfoBase.extensions	!== undefined) ? textureInfoBase.extensions	: null;
		this.extras		= (textureInfoBase.extras		!== undefined) ? textureInfoBase.extras		: null;
	}
}
export class Material {
	name?					:  string;
	extensions				:  any;
	extras					:  any;
	pbrMetallicRoughness	:  MaterialPbrMetallicRoughness;
	normalTexture?			:  MaterialNormalTextureInfo;
	occlusionTexture?		:  MaterialOcclusionTextureInfo;
	emissiveTexture?			:  TextureInfo;
	emissiveFactor			:  number[];
	alphaMode				:  "OPAQUE" | "MASK" | "BLEND";
	alphaCutoff				:  number;
	doubleSided				:  boolean;
	constructor(materialBase: MaterialBase) {
		this.name					= materialBase.name;
		this.extensions				= materialBase.extensions;
		this.extras					= materialBase.extras;
		this.pbrMetallicRoughness	= (materialBase.pbrMetallicRoughness	!== undefined) ? new MaterialPbrMetallicRoughness(materialBase.pbrMetallicRoughness) : new MaterialPbrMetallicRoughness({
			baseColorFactor				: [1, 1, 1, 1],
			baseColorTexture			: undefined,
			metallicFactor				: 1,
			roughnessFactor				: 1,
			metallicRoughnessTexture	: undefined,
		});
		this.normalTexture			= (materialBase.normalTexture			!== undefined) ? new MaterialNormalTextureInfo(materialBase.normalTexture)		: undefined;
		this.occlusionTexture		= (materialBase.occlusionTexture		!== undefined) ? new MaterialOcclusionTextureInfo(materialBase.occlusionTexture)	: undefined;
		this.emissiveTexture		= (materialBase.emissiveTexture			!== undefined) ? new TextureInfo(materialBase.emissiveTexture)					: undefined;
		this.emissiveFactor			= (materialBase.emissiveFactor			!== undefined) ? materialBase.emissiveFactor	: [0, 0, 0];
		this.alphaMode				= (materialBase.alphaMode				!== undefined) ? materialBase.alphaMode			: "OPAQUE";
		this.alphaCutoff			= (materialBase.alphaCutoff				!== undefined) ? materialBase.alphaCutoff		: 0.5;
		this.doubleSided			= !!materialBase.doubleSided;
	}
}
export class MaterialPbrMetallicRoughness {
	baseColorFactor				:  number[];
	baseColorTexture?			:  TextureInfoBase;
	metallicFactor				:  number;
	roughnessFactor				:  number;
	metallicRoughnessTexture?	:  TextureInfoBase;
	extensions					:  any;
	extras						:  any;
	constructor(materialPbrMetallicRoughnessBase: MaterialPbrMetallicRoughnessBase) {
		this.baseColorFactor			= (materialPbrMetallicRoughnessBase.baseColorFactor				!== undefined) ? materialPbrMetallicRoughnessBase.baseColorFactor	: [1, 1, 1, 1];
		this.baseColorTexture			= (materialPbrMetallicRoughnessBase.baseColorTexture			!== undefined) ? new TextureInfo(materialPbrMetallicRoughnessBase.baseColorTexture): undefined;
		this.metallicFactor				= (materialPbrMetallicRoughnessBase.metallicFactor				!== undefined) ? materialPbrMetallicRoughnessBase.metallicFactor	: 1;
		this.roughnessFactor			= (materialPbrMetallicRoughnessBase.roughnessFactor				!== undefined) ? materialPbrMetallicRoughnessBase.roughnessFactor	: 1;
		this.metallicRoughnessTexture	= (materialPbrMetallicRoughnessBase.metallicRoughnessTexture	!== undefined) ? new TextureInfo(materialPbrMetallicRoughnessBase.metallicRoughnessTexture): undefined;
		this.extensions					= (materialPbrMetallicRoughnessBase.extensions					!== undefined) ? materialPbrMetallicRoughnessBase.extensions		: null;
		this.extras						= (materialPbrMetallicRoughnessBase.extras						!== undefined) ? materialPbrMetallicRoughnessBase.extras			: null;
	}
}
export class MaterialNormalTextureInfo {
	index		:  any;
	texCoord	:  any;
	scale		:  number;
	extensions	:  any;
	extras		:  any;
	constructor(materialNormalTextureInfoBase: MaterialNormalTextureInfoBase) {
		this.index		= (materialNormalTextureInfoBase.index		!== undefined) ? materialNormalTextureInfoBase.index		: 0;
		this.texCoord	= (materialNormalTextureInfoBase.texCoord	!== undefined) ? materialNormalTextureInfoBase.texCoord		: 0;
		this.scale		= (materialNormalTextureInfoBase.scale		!== undefined) ? materialNormalTextureInfoBase.scale		: 1;
		this.extensions	= (materialNormalTextureInfoBase.extensions	!== undefined) ? materialNormalTextureInfoBase.extensions	: null;
		this.extras		= (materialNormalTextureInfoBase.extras		!== undefined) ? materialNormalTextureInfoBase.extras		: null;
	}
}
export class MaterialOcclusionTextureInfo {
	index		:  any;
	texCoord	:  any;
	strength	:  number;
	extensions	:  any;
	extras		:  any;
	constructor(materialOcclusionTextureInfoBase: MaterialOcclusionTextureInfoBase) {
		this.index		= (materialOcclusionTextureInfoBase.index		!== undefined) ? materialOcclusionTextureInfoBase.index			: 0;
		this.texCoord	= (materialOcclusionTextureInfoBase.texCoord	!== undefined) ? materialOcclusionTextureInfoBase.texCoord		: 0;
		this.strength	= (materialOcclusionTextureInfoBase.strength	!== undefined) ? materialOcclusionTextureInfoBase.strength		: 1;
		this.extensions	= (materialOcclusionTextureInfoBase.extensions	!== undefined) ? materialOcclusionTextureInfoBase.extensions	: null;
		this.extras		= (materialOcclusionTextureInfoBase.extras		!== undefined) ? materialOcclusionTextureInfoBase.extras		: null;
	}
}
export class Skin {
	inverseBindMatrices?				:  Accessor;
	skeleton?						:  Node;
	joints							:  Node[];
	name?							:  string;
	extensions						:  any;
	extras							:  any;
	isLink							:  boolean;
	inverseBindMatricesData?			:  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
	inverseBindMatrix?				:  mat4[];
	constructor(skinBase: SkinBase, gltf: GLTF) {
		this.inverseBindMatrices	= (skinBase.inverseBindMatrices	!== undefined) ? (gltf.accessors as Accessor[])[skinBase.inverseBindMatrices]	: undefined;
		this.skeleton				= (skinBase.skeleton			!== undefined) ? (gltf.nodes as Node[])[skinBase.skeleton]					: undefined;
		this.joints					=  [];
		for (let i = 0; i < skinBase.joints.length; i++) {
			this.joints.push((gltf.nodes as Node[])[skinBase.joints[i]]);
		}		
		this.name					= skinBase.name;
		this.extensions				= skinBase.extensions;
		this.extras					= skinBase.extras;
		this.isLink					=  false;
		if (this.inverseBindMatrices) {
			this.inverseBindMatricesData = glTFLoaderBasic.getAccessorData(this.inverseBindMatrices);
			this.inverseBindMatrix = [];
			for(let i = 0; i < this.inverseBindMatricesData.length; i += 16) {
				this.inverseBindMatrix.push(
					mat4.fromValues(
						this.inverseBindMatricesData[i],		this.inverseBindMatricesData[i + 1],	this.inverseBindMatricesData[i + 2],	this.inverseBindMatricesData[i + 3],
						this.inverseBindMatricesData[i + 4],	this.inverseBindMatricesData[i + 5],	this.inverseBindMatricesData[i + 6],	this.inverseBindMatricesData[i + 7],
						this.inverseBindMatricesData[i + 8],	this.inverseBindMatricesData[i + 9],	this.inverseBindMatricesData[i + 10],	this.inverseBindMatricesData[i + 11],
						this.inverseBindMatricesData[i + 12],	this.inverseBindMatricesData[i + 13],	this.inverseBindMatricesData[i + 14],	this.inverseBindMatricesData[i + 15],
					)
				);
			}
		}
	}
}
export class SkinLink {
	inverseBindMatrices?				:  Accessor;
	skeleton?						:  Node;
	joints							:  Node[];
	name?							:  string;
	extensions						:  any;
	extras							:  any;
	isLink							:  boolean
	inverseBindMatricesData?			:  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
	inverseBindMatrix?				:  mat4[];
	constructor(linkedSkin: Skin, gltf: GLTF, inverseBindMatricesAccessorID?: number) {
		if (!gltf.skins) {
			gltf.skins = [];
		}
		gltf.skins.push(this);
		this.inverseBindMatrices	= (inverseBindMatricesAccessorID	!== undefined) ? (gltf.accessors as Accessor[])[inverseBindMatricesAccessorID]	: undefined;
		this.skeleton				=  linkedSkin.skeleton;
		this.joints					=  linkedSkin.joints;		
		this.name					=  linkedSkin.name;
		this.extensions				=  linkedSkin.extensions;
		this.extras					=  linkedSkin.extras;
		this.isLink					=  true;
		if (this.inverseBindMatrices) {
			this.inverseBindMatricesData = glTFLoaderBasic.getAccessorData(this.inverseBindMatrices);
			this.inverseBindMatrix = [];
			for(let i = 0; i < this.inverseBindMatricesData.length; i += 16) {
				this.inverseBindMatrix.push(
					mat4.fromValues(
						this.inverseBindMatricesData[i],		this.inverseBindMatricesData[i + 1],	this.inverseBindMatricesData[i + 2],	this.inverseBindMatricesData[i + 3],
						this.inverseBindMatricesData[i + 4],	this.inverseBindMatricesData[i + 5],	this.inverseBindMatricesData[i + 6],	this.inverseBindMatricesData[i + 7],
						this.inverseBindMatricesData[i + 8],	this.inverseBindMatricesData[i + 9],	this.inverseBindMatricesData[i + 10],	this.inverseBindMatricesData[i + 11],
						this.inverseBindMatricesData[i + 12],	this.inverseBindMatricesData[i + 13],	this.inverseBindMatricesData[i + 14],	this.inverseBindMatricesData[i + 15],
					)
				);
			}
		}
	}
}
export class Animation {
	samplers		:  AnimationSampler[];
	channels		:  AnimationChannel[];
	name			:  string | null;
	extensions		:  any;
	extras			:  any;
	constructor(animationBase: AnimationBase, gltf: GLTF) {
		this.samplers = [];
		for (let i = 0; i < animationBase.samplers.length; i++) {
			this.samplers.push(new AnimationSampler(animationBase.samplers[i], gltf));
		}
		this.channels = [];
		for (let i = 0; i < animationBase.channels.length; i++) {
			this.channels.push(new AnimationChannel(animationBase.channels[i], this));
		}
		this.name					= (animationBase.name				!== undefined) ? animationBase.name				: null;
		this.extensions				= (animationBase.extensions			!== undefined) ? animationBase.extensions		: null;
		this.extras					= (animationBase.extras				!== undefined) ? animationBase.extras			: null;
	}
}
export class AnimationChannel {
	sampler		:  AnimationSampler;
	target		:  AnimationChannelTarget;
	extensions	:  any;
	extras		:  any;
	constructor(animationChannelBase: AnimationChannelBase, animation: Animation) {
		this.sampler	=  animation.samplers[animationChannelBase.sampler];
		this.target		=  new AnimationChannelTarget(animationChannelBase.target);
		this.extensions	= (animationChannelBase.extensions	!== undefined) ? animationChannelBase.extensions	: null;
		this.extras		= (animationChannelBase.extras		!== undefined) ? animationChannelBase.extras		: null;
	}
}
export class AnimationChannelTarget {
	node		:  Node | undefined;
	path		:  "translation" | "rotation" | "scale" | "weights";
	extensions	:  any;
	extras		:  any;
	nodeID		:  GLTFID | undefined;
	constructor(animationChannelTargetBase: AnimationChannelTargetBase) {
		//id, to be hooked up to object later
		this.nodeID		=  animationChannelTargetBase.node;
		this.path		=  animationChannelTargetBase.path;
		this.extensions	= (animationChannelTargetBase.extensions	!== undefined) ? animationChannelTargetBase.extensions	: null;
		this.extras		= (animationChannelTargetBase.extras		!== undefined) ? animationChannelTargetBase.extras		: null;
	}
}
export class AnimationSampler {
	input				:  Accessor;
	interpolation		:  "LINEAR" | "STEP" | "CUBICSPLINE";
	output				:  Accessor;
	extensions			:  any;
	extras				:  any;
	keyFrameIndices		:  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
	keyFrameRaw			:  Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
	keyFrames			:  { src: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | null, dst: Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | null };
	currentIndex		:  number;
	startTime			:  number;
	endTime				:  number;
	duration			:  number;
	constructor(animationSamplerBase: AnimationSamplerBase, gltf: GLTF) {
		this.input				=  (gltf.accessors as Accessor[])[animationSamplerBase.input]; 
		this.interpolation		= (animationSamplerBase.interpolation	!== undefined) ? animationSamplerBase.interpolation : "LINEAR";
		this.output				=  (gltf.accessors as Accessor[])[animationSamplerBase.output];
		this.extensions			= (animationSamplerBase.extensions		!== undefined) ? animationSamplerBase.extensions	: null;
		this.extras				= (animationSamplerBase.extras			!== undefined) ? animationSamplerBase.extras		: null;
		this.keyFrameIndices	=  glTFLoaderBasic.getAccessorData(this.input);
		this.keyFrameRaw		=  glTFLoaderBasic.getAccessorData(this.output);
		this.keyFrames			= {src: null, dst: null};
		this.currentIndex		= 0;
		this.startTime			= this.keyFrameIndices[0];
		this.endTime			= this.keyFrameIndices[this.keyFrameIndices.length - 1];
		this.duration			= this.endTime - this.startTime;
	}
	updateKeyFrames(time: number): void  {
		while (this.currentIndex < this.keyFrameIndices.length - 2 && time >= this.keyFrameIndices[this.currentIndex + 1]) {
			this.currentIndex++;
		}
		const byteLength = glTFLoaderBasic.accessorTypeToNumComponents(this.output.type);
		this.keyFrames.src = this.keyFrameRaw.slice(this.currentIndex * byteLength, (this.currentIndex + 1) * byteLength);
		this.keyFrames.dst = this.keyFrameRaw.slice((this.currentIndex + 1) * byteLength, (this.currentIndex + 2) * byteLength);
		if (time >= this.endTime) {
			this.currentIndex = 0;
		}
	}
}

export class GLTF {
	public asset				:  AssetBase;
	public scene				?: Scene;
	public scenes				: Scene[];
	public nodes				: Node[];
	public meshes				: Mesh[];
	public accessors			: Accessor[];
	public bufferViews			: BufferView[];
	public buffers				: ArrayBuffer[];
	public animations			: Animation[];
	public cameras				: Camera[];
	public textures			    : Texture[];
	public images				: (ImageBitmap | ImageData |  HTMLImageElement)[];
	public samplers			    : Sampler[];
	public materials			: Material[];
	public skins				: (Skin | SkinLink)[];
	public extensions			?: any;
	public extensionsUsed		?: string[];
	public extensionsRequired	?: string[];
	public extras				?: any;
	constructor(glTFBase: GLTFSource) {
		this.asset				=  glTFBase.asset;
		this.scenes				= [];
		this.nodes				= [];
		this.meshes				= [];
		this.accessors			= [];
		this.bufferViews		= [];
		this.buffers			= [];
		this.animations			= [];
		this.cameras			= [];
		this.textures			= [];
		this.images				= [];
		this.samplers			= [];
		this.materials			= [];
		this.skins				= [];
		this.extensions			= (glTFBase.extensions			!== undefined) ? glTFBase.extensions			: undefined;
		this.extensionsUsed		= (glTFBase.extensionsUsed		!== undefined) ? glTFBase.extensionsUsed		: undefined;
		this.extensionsRequired	= (glTFBase.extensionsRequired	!== undefined) ? glTFBase.extensionsRequired	: undefined;
		this.extras				= (glTFBase.extras				!== undefined) ? glTFBase.extras				: undefined;
	}
}
