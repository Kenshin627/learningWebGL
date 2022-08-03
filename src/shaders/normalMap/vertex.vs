#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
in vec3 a_normal;
in vec3 a_tangent;
in vec3 a_bitangent;

out vec2 texcoord;

out vec3 position;
out vec3 normal;
out mat3 tbn;

uniform mat4 u_model;
uniform mat4 u_timodel;
uniform mat4 u_view;
uniform mat4 u_projection;

void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    texcoord = a_texcoord;
    position = (u_model * a_position).xyz;
    normal = normalize(mat3(u_timodel) * a_normal);

    vec3 tangent = normalize(vec3(u_model * vec4(a_tangent, 0.0)));
    vec3 bitangent =  normalize(vec3(u_model * vec4(a_bitangent, 0.0)));
    vec3 nn = normalize(vec3(u_model * vec4(a_normal, 0.0)));
    tbn = mat3(tangent, bitangent, nn);
    mat3 inverseTBN = inverse(tbn);

}