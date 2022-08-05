#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec3 position;
out vec3 normal;
out vec2 texcoord;

uniform mat4 u_model;
uniform mat4 U_normalMatrix;
uniform mat4 u_view;
uniform mat4 u_projection;

void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    texcoord = a_texcoord;
    position = (u_model * a_position).xyz;
    normal = normalize(mat3(U_normalMatrix) * a_normal);
}