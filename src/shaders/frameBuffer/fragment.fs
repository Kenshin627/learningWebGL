#version 300 es
uniform sampler2D screenTexture;
in vec2 v_texcoord;
out vec4 finalColor;

void main(){
    finalColor = texture(screenTexture, v_texcoord);
}