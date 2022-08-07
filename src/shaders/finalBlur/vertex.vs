#version 300 es
in vec3 a_position;
in vec2 a_texcoord;

out vec2 TexCoords;

void main() {
    TexCoords = a_texcoord;
    gl_Position = vec4(a_position, 1.0);
}