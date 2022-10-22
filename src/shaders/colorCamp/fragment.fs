#version 300 es
precision highp float;
in vec2 texcoord;

out vec4 outColor;
uniform sampler2D sampler;
uniform vec4 glow;

void main(){
    //mix
    vec2 uv = texcoord;
    uv.y = 1.0 - uv.y;
    vec4 textureColor = texture(sampler, uv);
    
    // textureColor += textureColor * glow;

    // vec3 flapColor = abs(1.0 -textureColor.rgb);
    // outColor = vec4(flapColor, textureColor.a);

    float p = (textureColor.r + textureColor.g + textureColor.b) / 3.0;
    outColor = vec4(p,p,p, 1.0);
}