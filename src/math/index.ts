import { vec2, vec3 } from "gl-matrix";

//0-2 position 3-4 texcoord
export interface Triangle {
    p0: [ number, number, number, number, number ],
    p1: [ number, number, number, number, number ],
    p2: [ number, number, number, number, number ]
}

export function calculationTBN(triangle: Record<'p0' | 'p1' | 'p2', number[]>) {
    let normalizeTriangle: Record<'p0' | 'p1' | 'p2', Record<'position' | 'texcoord', any>> = {
        p0: {
            position: null,
            texcoord: null
        },
        p1: {
            position: null,
            texcoord: null
        },
        p2: {
            position: null,
            texcoord: null
        }
    }
    for (const [k, v] of Object.entries(triangle)) {
        (normalizeTriangle as any)[k] = {
            position: v.slice(0, 3),
            texcoord: v.slice(3, 5)
        }
    }
    
    let edge1 = vec3.create();
    let edge2 = vec3.create();
    vec3.subtract(edge1, normalizeTriangle.p1.position, normalizeTriangle.p0.position);
    vec3.subtract(edge2, normalizeTriangle.p2.position, normalizeTriangle.p0.position);

    let deltaUV1 = vec2.create();
    let deltaUV2 = vec2.create();
    vec2.subtract(deltaUV1, normalizeTriangle.p1.texcoord, normalizeTriangle.p0.texcoord);
    vec2.subtract(deltaUV2, normalizeTriangle.p2.texcoord, normalizeTriangle.p0.texcoord);

    let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1]);
    let tangent: vec3 = vec3.create();

    tangent[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0]);
    tangent[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1]);
    tangent[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2]);
    vec3.normalize(tangent, tangent);
    
    let bitangent: vec3 = vec3.create();

    bitangent[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0]);
    bitangent[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1]);
    bitangent[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2]);
    vec3.normalize(bitangent, bitangent);

    return {
        tangent,
        bitangent
    }
}