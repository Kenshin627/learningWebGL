#version 300 es
precision highp float;
in vec2 texcoord;
out vec4 outColor;
uniform sampler2D sampler;
uniform float u_time;

float luminance(vec4 color) {
    return 0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b;
}

float sobel(vec2 uvs[9]) {
    float Gx[9];
    Gx[0] = -1.0; Gx[1] = -2.0; Gx[2] = -1.0;
    Gx[3] = 0.0 ; Gx[4] = 0.0 ; Gx[5] = 0.0; 
    Gx[6] = 1.0 ; Gx[7] = 2.0 ; Gx[8] = 1.0;

    float Gy[9];
    Gy[0] = -1.0 ; Gy[1] = 0.0 ; Gy[2] = 1.0;
    Gy[3] = -2.0 ; Gy[4] = 0.0 ; Gy[5] = 2.0; 
    Gy[6] = -1.0 ; Gy[7] = 0.0 ; Gy[8] = 1.0;

    float texColor = 0.0;
    float edgeX = 0.0;
    float edgeY = 0.0;
    texColor = luminance(texture(sampler, uvs[0])); edgeX += texColor * Gx[0]; edgeY += texColor * Gy[0];
    texColor = luminance(texture(sampler, uvs[1])); edgeX += texColor * Gx[1]; edgeY += texColor * Gy[1];
    texColor = luminance(texture(sampler, uvs[2])); edgeX += texColor * Gx[2]; edgeY += texColor * Gy[2];
    texColor = luminance(texture(sampler, uvs[3])); edgeX += texColor * Gx[3]; edgeY += texColor * Gy[3];
    texColor = luminance(texture(sampler, uvs[4])); edgeX += texColor * Gx[4]; edgeY += texColor * Gy[4];
    texColor = luminance(texture(sampler, uvs[5])); edgeX += texColor * Gx[5]; edgeY += texColor * Gy[5];
    texColor = luminance(texture(sampler, uvs[6])); edgeX += texColor * Gx[6]; edgeY += texColor * Gy[6];
    texColor = luminance(texture(sampler, uvs[7])); edgeX += texColor * Gx[7]; edgeY += texColor * Gy[7];
    texColor = luminance(texture(sampler, uvs[8])); edgeX += texColor * Gx[8]; edgeY += texColor * Gy[8];

    float edge = abs(edgeX) + abs(edgeY);
    return edge;
}

void main(){
    vec2 uv = texcoord;
    ivec2 st = textureSize(sampler, 0);
    vec2 ss = vec2(float(st.x), float(st.y));
    vec2 tex_offset = vec2(1.) / ss;
    uv.y = 1. - uv.y;
    vec2 uvs[9];
    uvs[0] = uv + tex_offset * vec2(-1., 1.);
    uvs[1] = uv + tex_offset * vec2(0., 1.);
    uvs[2] = uv + tex_offset * vec2(1., 1.);
    uvs[3] = uv + tex_offset * vec2(-1., 0.);
    uvs[4] = uv + tex_offset * vec2(0., 0.);
    uvs[5] = uv + tex_offset * vec2(1., 0.);
    uvs[6] = uv + tex_offset * vec2(-1., -1.);
    uvs[7] = uv + tex_offset * vec2(0., -1.);
    uvs[8] = uv + tex_offset * vec2(1., -1.);


    float edge = sobel(uvs);
    outColor = vec4(vec3(edge), 1.0);

    
}