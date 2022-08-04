#version 300 es
precision highp float;
uniform sampler2D screenTexture;
in vec2 v_texcoord;
out vec4 finalColor;

vec3 kernel(float[9] ks);
void main(){
    vec3 c = texture(screenTexture, v_texcoord).rgb;
    float averge = (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 3.0;
    //灰度
    finalColor = vec4(vec3(averge), 1.0); 

    //反相
    //finalColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, 1.0);  

    //正常
    //finalColor = vec4(v_texcoord, 0.0, 1.0); 
    
    //kernel sharpen
    // float sharpen[9] = float[](
    //      -1., -1., -1.,
    //     -1., 9., -1.,
    //     -1., -1., -1.
    // );
    // finalColor = vec4(kernel(sharpen), 1.0);

    // kernel bloom
    // float bloom[9] = float[](
    //     1.0/16.0, 2.0/16.0, 1.0/16.0,
    //     2.0/16.0, 4.0/16.0, 2.0/16.0,
    //     1.0/16.0, 2.0/16.0, 1.0/16.0
    // );
    // finalColor = vec4(kernel(bloom), 1.0);

    // kernel edge
    float edgeDetection[9] = float[](
        1.0, 1.0, 1.0,
        1.0, -8.0, 1.0,
        1.0, 1.0, 1.0
    );
    finalColor = vec4(kernel(edgeDetection), 1.0);
}

const float offset = 1.0 / 800.0;

vec3 kernel(float[9] ks) {
    vec2 offsets[9] = vec2[](
        vec2(-offset, offset),
        vec2(0, offset),
        vec2(offset, offset),
        vec2(-offset, 0),
        vec2(0, 0),
        vec2(offset, 0),
        vec2(-offset, -offset),
        vec2(0, -offset),
        vec2(offset, -offset)
    );
    vec3 col = vec3(0.0);
    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++) {
        col += sampleTex[i] = vec3(texture(screenTexture, v_texcoord + offsets[i])) * ks[i];
    }
    return col;
}