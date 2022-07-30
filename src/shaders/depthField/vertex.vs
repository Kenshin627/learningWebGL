#version 300 es
in vec4 a_position;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out float depth;

void main(){
    vec4 p = u_projection * u_view * u_model * a_position;
    depth = p.z / p.w;
    gl_Position = p;
}