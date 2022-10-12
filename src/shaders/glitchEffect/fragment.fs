#version 300 es
precision highp float;
in vec2 texcoord;

out vec4 outColor;
uniform sampler2D sampler;
uniform float pixelateSize;
uniform float ratio;

void main(){
    //test
    vec2 uv0 = texcoord;
    uv0.y = 1.0 - uv0.y;
    //pixelate
    vec2 step = vec2(pixelateSize, pixelateSize * ratio);
    vec2 uv1 = floor(texcoord * step) / step;
    uv1.y = 1.0 - uv1.y;
    outColor = texture(sampler, uv1);
}