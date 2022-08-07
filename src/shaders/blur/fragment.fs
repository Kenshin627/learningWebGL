#version 300 es
precision highp float;
out vec4 fargColor;

in vec2 TexCoords;

uniform sampler2D image;
uniform bool horizontal;
// uniform float weight[5] = 

void main() {
    float weight[5] = float[] (0.2270270270, 0.1945945946, 0.1216216216, 0.0540540541, 0.0162162162);

    ivec2 ts = textureSize(image, 0);
    vec2 tex_offset = vec2(1 / ts.x, 1 / ts.y);

    vec3 result = texture(image, TexCoords).rgb * weight[0];
    if(horizontal) {
        for(int i = 0; i < 5; i++) {
            result += texture(image, TexCoords + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
            result += texture(image, TexCoords - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i];
        }
    }else {
        for(int i = 0; i < 5; i++) {
            result += texture(image, TexCoords + vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
            result += texture(image, TexCoords - vec2(0.0, tex_offset.y * float(i))).rgb * weight[i];
        }
    }
    fargColor = vec4(result, 1.0);
}