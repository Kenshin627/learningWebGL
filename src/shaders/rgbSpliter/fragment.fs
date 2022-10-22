#version 300 es
precision highp float;
in vec2 texcoord;
out vec4 outColor;
uniform sampler2D sampler;
uniform float u_time;
uniform float u_colorDrift;

void main(){
    float drift = -(sin(u_time * 0.05) + 1.) * .5 * u_colorDrift * 0.1;

    vec2 offset = vec2(drift, 0.);
    vec2 uv = texcoord;
    uv.y = 1.0 -uv.y;
    vec4 color1 = texture(sampler, uv);
    vec4 color2 = texture(sampler, uv + offset);
    outColor = vec4(color1.r, color1.g, color2.b, 1.0);
}