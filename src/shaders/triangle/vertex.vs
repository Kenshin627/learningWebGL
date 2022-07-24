#version 300 es
in vec4 a_position;
in vec4 a_color;
out vec4 v_color;

uniform vec3 view_position;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform float u_ambient;

void main() {
    v_color = a_color;
    gl_Position = u_projection * u_view  * a_position;
}
