import { mat4, vec3, quat,  } from 'gl-matrix';

export type GLTFID = number;

export enum AccessorComponentType { 
	GL_BYTE 						= 5120, 
	GL_UNSIGNED_BYTE				= 5121,
	GL_SHORT						= 5122,
	GL_UNSIGNED_SHORT				= 5123,
	GL_INT							= 5124,
	GL_UNSIGNED_INT					= 5125,
	GL_FLOAT						= 5126
};

export enum AccessorSparseIndicesComponentType {
	GL_UNSIGNED_BYTE				= 5121,
	GL_UNSIGNED_SHORT				= 5123,
	GL_UNSIGNED_INT					= 5125
}

export enum MeshPrimitiveType {
	POINTS							= 0,
	LINES							= 1,
	LINE_LOOP						= 2,
	LINE_STRIP						= 3,
	TRIANGLES						= 4,
	TRIANGLE_STRIP					= 5,
	TRIANGLE_FAN					= 6
}

export const GLTF_ELEMENTS_PER_TYPE: Record<string, number> = {
    SCALAR: 1,
    VEC2:   2,
    VEC3:   3,
    VEC4:   4,
    MAT2:   4,
    MAT3:   9,
    MAT4:  16,
}

export enum BufferViewTarget {
	ARRAY_BUFFER					= 34962,
	ELEMENT_ARRAY_BUFFER			= 34963
}

export enum SamplerMagnificationFilter {
	NEAREST							= 9728,
	LINEAR							= 9729
}

export enum SamplerMinificationFilter {
	NEAREST							= 9728,
	LINEAR							= 9729,
	NEAREST_MIPMAP_NEAREST			= 9984,
	LINEAR_MIPMAP_NEAREST			= 9985,
	NEAREST_MIPMAP_LINEAR			= 9986,
	LINEAR_MIPMAP_LINEAR			= 9987
}

export enum SamplerWrappingMode {
	CLAMP_TO_EDGE					= 33071,
	MIRRORED_REPEAT					= 33648,
	REPEAT							= 10497
}

export interface AssetBase {
	copyright	?: string;
	generator	?: string;
	version		:  string;
	minVersion	?: string;
	extensions	?: any;
	extras		?: any;
}
export interface SceneBase {
	nodes		:  GLTFID[];
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface NodeBase {
	camera		?: GLTFID;
	children	?: GLTFID[];
	skin		?: GLTFID;
	matrix		:  mat4;
	mesh		?: GLTFID;
	translation	?: vec3;
	rotation	?: quat;
	scale		?: vec3;
	weights		?: number[];
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface MeshBase {
	primitives	:  MeshPrimitiveBase[];
	weights		?: number[];
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface MeshPrimitiveBase {
	attributes	:  {POSITION ?: GLTFID, NORMAL ?: GLTFID, TEXCOORD_0 ?: GLTFID};
	indices		?: GLTFID;
	material	?: GLTFID;
	mode		?: MeshPrimitiveType;
	targets		?: {POSITION ?: GLTFID, NORMAL ?: GLTFID, TANGENT ?: GLTFID}[];
	extensions	?: any;
	extras		?: any;
}
export interface AccessorBase {
	bufferView		?: GLTFID;
	byteOffset		?: number;
	componentType	:  AccessorComponentType;
	normalized		?: boolean;
	count			:  number;
	type			:  "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
	max				?: number[];
	min				?: number[];
	sparse			?: AccessorSparseBase;
	name			?: string;
	extensions		?: any;
	extras			?: any;
}
export interface AccessorSparseBase {
	count			:  number;
	indices			:  AccessorSparseIndicesBase;
	values			:  AccessorSparseValuesBase;
	extensions		?: any;
	extras			?: any;
}
export interface AccessorSparseIndicesBase {
	bufferView		:  GLTFID;
	byteOffset		?: number;
	componentType	:  AccessorSparseIndicesComponentType;
	extensions		?: any;
	extras			?: any;
}
export interface AccessorSparseValuesBase {
	bufferView		:  GLTFID;
	byteOffset		?: number;
	extensions		?: any;
	extras			?: any;
}
export interface BufferViewBase {
	buffer		:  GLTFID;
	byteOffset	?: number;
	byteLength	:  number;
	byteStride	?: number;
	target		?: BufferViewTarget;
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface BufferBase {
	uri			?: string;
	byteLength	:  number;
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface AnimationBase {
	channels		:  AnimationChannelBase[];
	samplers		:  AnimationSamplerBase[];
	name			?: string;
	extensions		?: any;
	extras			?: any;
}
export interface AnimationChannelBase {	
	sampler		:  GLTFID;
	target		:  AnimationChannelTargetBase;
	extensions	?: any;
	extras		?: any;
}
export interface AnimationChannelTargetBase{
	node		?: GLTFID;
	path		:  "translation" | "rotation" | "scale" | "weights";
	extensions	?: any;
	extras		?: any;
}
export interface AnimationSamplerBase {
	input			:  GLTFID;
	interpolation	?: "LINEAR" | "STEP" | "CUBICSPLINE";
	output			:  GLTFID;
	extensions		?: any;
	extras			?: any;
}
export interface CameraBase{
	orthographic	?: CameraOrthographicBase;
	perspective		?: CameraPerspectiveBase;
	type			:  "perspective" | "orthographic";
	name			?: string;
	extensions		?: any;
	extras			?: any;
}
export interface CameraOrthographicBase {
	xmag		:  number;
	ymag		:  number;
	zfar		:  number;
	znear		:  number;
	extensions	?: any;
	extras		?: any;
}
export interface CameraPerspectiveBase {
	aspectRatio	?: number;
	yfov		:  number;
	zfar		?: number;
	znear		:  number;
	extensions	?: any;
	extras		?: any;
}
export interface TextureBase {
	sampler		?: GLTFID;
	source		?: GLTFID;
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface ImageBase {
	uri			?: string;
	mimeType	?: "image/jpeg" | "image/png";
	bufferView	?: GLTFID;
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface SamplerBase {
	magFilter	:  SamplerMagnificationFilter;
	minFilter	:  SamplerMinificationFilter;
	wrapS		:  SamplerWrappingMode;
	wrapT		:  SamplerWrappingMode;
	name		?: string;
	extensions	?: any;
	extras		?: any;
}
export interface MaterialBase {
	name					?: string;
	extensions				?: any;
	extras					?: any;
	pbrMetallicRoughness	?: MaterialPbrMetallicRoughnessBase;
	normalTexture			?: MaterialNormalTextureInfoBase;
	occlusionTexture		?: MaterialOcclusionTextureInfoBase;
	emissiveTexture			?: TextureInfoBase;
	emissiveFactor			?: number[];
	alphaMode				?: "OPAQUE" | "MASK" | "BLEND";
	alphaCutoff				?: number;
	doubleSided				?: boolean;
}
export interface MaterialPbrMetallicRoughnessBase {
	baseColorFactor				:  number[];
	baseColorTexture?			:  TextureInfoBase;
	metallicFactor				:  number;
	roughnessFactor				:  number;
	metallicRoughnessTexture?	:  TextureInfoBase;
	extensions					?: any;
	extras						?: any;
}
export interface MaterialNormalTextureInfoBase {
	index		?: any;
	texCoord	?: any;
	scale		?: number;
	extensions	?: any;
	extras		?: any;
}
export interface MaterialOcclusionTextureInfoBase {
	index		?: any;
	texCoord	?: any;
	strength	?: number;
	extensions	?: any;
	extras		?: any;
}
export interface TextureInfoBase {
	index		:  GLTFID;
	texCoord	?: number;
	extensions	?: any;
	extras		?: any;
}
export interface SkinBase {
	inverseBindMatrices	?: GLTFID;
	skeleton			?: GLTFID;
	joints				:  GLTFID[];
	name				?: string;
	extensions			?: any;
	extras				?: any;
}

export interface GLTFSource {
    asset: AssetBase;
	scenes?: SceneBase[];
	scene?: GLTFID;
	nodes?: NodeBase[];
	meshes?: MeshBase[];
	accessors?: AccessorBase[];
	bufferViews?: BufferViewBase[];
	buffers?: BufferBase[];
	animations?: AnimationBase[];
	cameras?: CameraBase[];
	textures?: TextureBase[];
	images?: ImageBase[];
	samplers?: SamplerBase[];
	materials?: MaterialBase[];
	skins?: SkinBase[];
	extensions?: any;
	extensionsRequired?: string[];
	extensionsUsed?: string[];
	extras?: any;
}
