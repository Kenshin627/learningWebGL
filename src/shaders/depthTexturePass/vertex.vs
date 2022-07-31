#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 lightPositionMatrix;

void main(){
    gl_Position = lightPositionMatrix * u_model * a_position;
}