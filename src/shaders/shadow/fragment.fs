#version 300 es
precision highp float;

uniform sampler2D depthSampler;
uniform vec3 randomColor;
uniform vec3 lightDir;
uniform vec3 lightPos;

out vec4 outColor;

in vec4 lightSpacePosition;
in vec3 v_normal;
in vec3 model_Pos;

float shadowCalc(vec4 lightSpacePosition) {
    vec3 projCoords = lightSpacePosition.xyz / lightSpacePosition.w;
    projCoords = projCoords * 0.5 + 0.5;
    // vec3 lightDir = normalize(lightPos - model_Pos);
    float bias = max(0.05 * (1.0 - dot(normalize(v_normal), lightDir)), 0.005);
    float currentDepth = projCoords.z;
    ivec2 ts = textureSize(depthSampler, 0);
    vec2 texelSize = vec2(1 / ts.x, 1 / ts.y);
    float shadow = 0.0;
    for(int x = -2; x <= 2; ++x) {
        for(int y = -2; y <= 2; ++y) {
            float pcfDepth = texture(depthSampler, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += currentDepth - bias  > pcfDepth? 1.0 : 0.0;
        }
    }
    shadow /= 25.0;
    if(projCoords.z > 1.0) {
        shadow = 0.0;
    }
    return shadow;
}

void main() {
    float shadow = shadowCalc(lightSpacePosition);
    shadow = min(shadow, 0.5);
    outColor = vec4(randomColor * (1.0 - shadow), 1.0);
}