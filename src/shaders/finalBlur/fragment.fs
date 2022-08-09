#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 TexCoords;

uniform sampler2D scene;
uniform sampler2D bloomBlur;
uniform float exposure;

void main() {
    const float gamma = 2.2;
    vec3 sceneColor = texture(scene, TexCoords).rgb;
    vec3 bloomColor = texture(bloomBlur, TexCoords).rgb;

    sceneColor += bloomColor;
    vec3 result = vec3(1.0) - exp(-sceneColor * exposure);
    result = pow(result, vec3(1.0 / gamma));
    fragColor = vec4(result, 1.0);
}