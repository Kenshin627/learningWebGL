#version 300 es
precision highp float;

uniform sampler2D depthSampler;
uniform vec3 randomColor;
out vec4 outColor;

// in vec4 modelPosition;
in vec4 lightSpacePosition;

float shadowCalc(vec4 lightSpacePosition) {
    vec3 projCoords = lightSpacePosition.xyz / lightSpacePosition.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(depthSampler, projCoords.xy).r;
    float currentDepth = projCoords.z;
    float inShadow = currentDepth < closestDepth? 0.5 : 1.0;
    return inShadow;
}

void main() {
    float inShadow = shadowCalc(lightSpacePosition);
    outColor = vec4(randomColor * inShadow, 1.0);
}