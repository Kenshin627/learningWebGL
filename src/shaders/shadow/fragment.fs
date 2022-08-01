#version 300 es
precision highp float;

uniform sampler2D depthSampler;
uniform vec3 randomColor;
uniform vec3 lightPosition;

out vec4 outColor;

// in vec4 modelPosition;
in vec4 lightSpacePosition;
in vec3 v_normal;
in vec3 model_Pos;

float shadowCalc(vec4 lightSpacePosition) {
    vec3 projCoords = lightSpacePosition.xyz / lightSpacePosition.w;
    projCoords = projCoords * 0.5 + 0.5;
    vec3 lightDir = normalize(lightPosition - model_Pos);
    float bias = max(0.05 * (1.0 - dot(v_normal, lightDir)), 0.005);
    float currentDepth = projCoords.z;
    ivec2 ts = textureSize(depthSampler, 0);
    vec2 texelSize = vec2(1 / ts.x, 1 / ts.y);
    // texelSize = vec2(texelSize.x * 1.0, texelSize.y * 1.0);
    float shadow = 0.0;
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(depthSampler, projCoords.xy + vec2(x, y)).r;
            shadow += currentDepth -bias > pcfDepth? 0.2 : 1.0;
        }
    }

    shadow /= 25.0;

    if(projCoords.z > 1.0) {
        shadow = 0.0;
    }
    // float inShadow = currentDepth - bias > closestDepth? 0.5 : 1.0;
    return shadow;
}

void main() {
    float shadow = shadowCalc(lightSpacePosition);
    outColor = vec4(randomColor * shadow, 1.0);
}