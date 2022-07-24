#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec2 a_texcoord;

out vec4 v_color;
out vec2 texcoord;
uniform mat4 u_view;
uniform mat4 u_projection;

void main(){
    gl_Position = u_projection * u_view * a_position;
    v_color = a_color;
    texcoord = a_texcoord;
}