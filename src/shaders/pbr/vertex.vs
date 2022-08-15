#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec2 texcoord;
out vec3 fragPos;
out vec3 normal;

void main() {
    gl_Position = u_projection * u_view * u_model * a_position;
    texcoord = a_texcoord;
    normal = mat3(u_model) * a_normal;
    fragPos = (u_model * a_position).xyz;
}