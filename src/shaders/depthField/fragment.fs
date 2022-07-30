#version 300 es
precision highp float;
// in vec2 v_texcoord;

// uniform sampler2D depthSampler;
uniform float near;
uniform float far;

out vec4 outColor;
in float depth;

float LinearizeDepth(float depth) 
{
    float z = depth * 2.0 - 1.0;
    return (2.0 * near ) / (far + near - z *( far - near));
    // return z;
}

void main() {
    // float depthV = (texture(depthSampler, v_texcoord)).r;
    // outColor = vec4(vec3(LinearizeDepth(depthV) / far), 1.0);
    outColor = vec4(vec3(LinearizeDepth(depth) ), 1.0);
}