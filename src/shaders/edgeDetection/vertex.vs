#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
out vec2 texcoord;
uniform vec3 view_position;
uniform mat4 u_view;
uniform mat4 u_projection;

void main(){
    
    gl_Position = u_projection * u_view * a_position;
    texcoord = a_texcoord;
}