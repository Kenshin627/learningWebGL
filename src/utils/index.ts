import { BoundingBox } from "../gl/loaders/sceneLoader/gltftypes";
import { vec3, mat4 } from "gl-matrix";

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