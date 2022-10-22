#version 300 es
precision highp float;
in vec2 texcoord;
out vec4 outColor;
uniform sampler2D sampler;
uniform float u_time;
uniform float u_colorDrift;

float randomNoise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main(){
    vec2 uv = texcoord;
    float splitAmount = .65 * randomNoise(vec2(u_time, 2.));
    uv.y = 1.0 -uv.y;
    vec4 colorR = texture(sampler, vec2(uv.x + splitAmount, uv.y + splitAmount));
    vec4 colorG = texture(sampler, uv);
    vec4 colorB = texture(sampler, vec2(uv.x -splitAmount, uv.y - splitAmount));
    outColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
}