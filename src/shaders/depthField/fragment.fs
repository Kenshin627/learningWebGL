#version 300 es
precision highp float;

uniform float near;
uniform float far;

out vec4 outColor;
in float depth;

float LinearizeDepth(float depth) 
{
    float z = depth * 2.0 - 1.0;
    return (2.0 * near ) / (far + near - z *( far - near));
}

void main() {
    outColor = vec4(vec3(LinearizeDepth(depth)), 1.0);
}