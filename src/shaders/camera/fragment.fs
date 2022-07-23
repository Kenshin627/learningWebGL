#version 300 es
precision highp float;
in vec4 v_color;
in vec2 texcoord;

out vec4 outColor;
uniform sampler2D sampler;

void main(){
    outColor = texture(sampler, texcoord);
}