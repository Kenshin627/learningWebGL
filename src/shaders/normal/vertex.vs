#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec3 normal;
uniform mat4 u_model;
uniform mat4 u_timodel;
uniform mat4 u_view;
uniform mat4 u_projection;

void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    normal = normalize(mat3(u_timodel) * a_normal);
}