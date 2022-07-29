
import { mat4, vec3 } from 'gl-matrix';
import { AccessorComponentType } from "./gltftypes";
import { Accessor, BoundingBox } from "./model";

export module glTFLoaderBasic {
    export function accessorTypeToNumComponents(type: string): number {
        const accessorMap = new Map<string, number>([
            ["SCALAR",	1],
			["VEC2",	2],
			["VEC3",	3],
			["VEC4",	4],
			["MAT2",	4],
			["MAT3",	9],
			["MAT4",	16]
        ])
        if (accessorMap.has(type)) {
            return accessorMap.get(type) as number;
        }
        throw new Error(`no key error: no numCoponents for accessorType ${type}`);
    }

    type typedArray = Int8ArrayConstructor | Uint8ArrayConstructor | Int16ArrayConstructor | Uint16ArrayConstructor | Int32ArrayConstructor | Uint32ArrayConstructor | Float32ArrayConstructor;
    export function glTypeToTypedArray(type: AccessorComponentType) {
        const typeMap = new Map<number, typedArray>([
            [5120, Int8Array],		// gl.BYTE
			[5121, Uint8Array],		// gl.UNSIGNED_BYTE
			[5122, Int16Array],		// gl.SHORT
			[5123, Uint16Array],	// gl.UNSIGNED_SHORT
			[5124, Int32Array],		// gl.INT
			[5125, Uint32Array],	// gl.UNSIGNED_INT
			[5126, Float32Array]	// gl.FLOAT
        ])
        if (typeMap.has(type)) {
            return typeMap.get(type) as typedArray;
        }
        throw new Error(`no key error: no typedArray for glType ${type}`);
    }

    export function getAccessorData(accecssor: Accessor): Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array {
        const typedArray = glTFLoaderBasic.glTypeToTypedArray(accecssor.componentType);
        return new typedArray(accecssor.bufferView.data, accecssor.bufferView.byteOffset, accecssor.bufferView.byteLength);
    }
}

export function getAABBFromOBB(obb: BoundingBox, matrix: mat4): BoundingBox{
	let transformRight		: vec3 = vec3.fromValues(matrix[0], matrix[1], matrix[2]);
	let transformUp			: vec3 = vec3.fromValues(matrix[4], matrix[5], matrix[6]);
	let transformBackward	: vec3 = vec3.fromValues(matrix[8], matrix[9], matrix[10]);

	let tmpVec3a 			: vec3 = vec3.create();
	let tmpVec3b 			: vec3 = vec3.create();

	let min = vec3.fromValues(matrix[12], matrix[13], matrix[14]);  // init with matrix translation
	let max = vec3.clone(min);

	vec3.scale(tmpVec3a, transformRight, obb.min[0]);
	vec3.scale(tmpVec3b, transformRight, obb.max[0]);
	vec3.min(transformRight, tmpVec3a, tmpVec3b);
	vec3.add(min, min, transformRight);
	vec3.max(transformRight, tmpVec3a, tmpVec3b);
	vec3.add(max, max, transformRight);

	tmpVec3a			= vec3.scale(tmpVec3a, transformUp, obb.min[1]);
	tmpVec3b 			= vec3.scale(tmpVec3b, transformUp, obb.max[1]);
	vec3.min(transformUp, tmpVec3a, tmpVec3b);
	vec3.add(min, min, transformUp);
	vec3.max(transformUp, tmpVec3a, tmpVec3b);
	vec3.add(max, max, transformUp);

	tmpVec3a			= vec3.scale(tmpVec3a, transformBackward, obb.min[2]);
	tmpVec3b 			= vec3.scale(tmpVec3b, transformBackward, obb.max[2]);
	vec3.min(transformBackward, tmpVec3a, tmpVec3b);
	vec3.add(min, min, transformBackward);
	vec3.max(transformBackward, tmpVec3a, tmpVec3b);
	vec3.add(max, max, transformBackward);

	let axisAlignedBoundingBox = new BoundingBox(min, max, false);
	axisAlignedBoundingBox.calculateTransform();
	return axisAlignedBoundingBox;
}