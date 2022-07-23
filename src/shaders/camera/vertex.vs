#version 300 es
in vec4 a_position;
in vec4 a_color;
in vec2 a_texcoord;
in vec3 a_normal;

out vec4 v_color;
out vec2 texcoord;

out vec3 position;
out vec3 normal;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform mat4 u_model;
uniform mat4 u_timodel;
uniform mat4 u_viewprojection;

void main(){
    gl_Position = u_viewprojection * u_model * a_position;
    v_color = a_color;
    texcoord = a_texcoord;
    position = (u_model * a_position).xyz;
    normal = normalize(mat3(u_timodel) * a_normal);
}