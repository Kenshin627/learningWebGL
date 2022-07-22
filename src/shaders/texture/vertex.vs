#version 300 es
in vec2 a_position;
in vec3 a_color;
in vec2 a_texcoord;

out vec4 v_color;
out vec2 texcoord;
uniform mat3 u_matrix;
void main(){
    gl_Position = vec4((u_matrix * vec3(a_position, 1.0)).xy, 0.0, 1.0);
    v_color = vec4(a_color, 1.0);
    texcoord = a_texcoord;
}