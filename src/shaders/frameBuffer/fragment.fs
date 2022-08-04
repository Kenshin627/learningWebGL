#version 300 es
precision highp float;
uniform sampler2D screenTexture;
in vec2 v_texcoord;
out vec4 finalColor;

void main(){
    vec3 c = texture(screenTexture, v_texcoord).rgb;
    float averge = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 3.0;
    //finalColor = vec4(vec3(averge), 1.0); 灰度
    //finalColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, 1.0);  反相
    //finalColor = vec4(v_texcoord, 0.0, 1.0); //正常
    //
}