#version 300 es
precision highp float;
uniform sampler2D screenTexture;
in vec2 v_texcoord;
out vec4 finalColor;

void main(){
    finalColor = texture(screenTexture, v_texcoord);
    // finalColor = vec4(v_texcoord, 0.0, 1.0);
}