#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 lightPositionMatrix;

// out vec4 modelPosition;
out vec4 lightSpacePosition;
out vec3 v_normal;
out vec3 model_Pos;

void main(){
    gl_Position = u_projection * u_view * u_model * a_position;
    lightSpacePosition = lightPositionMatrix * u_model * a_position;
    v_normal = a_normal;
    model_Pos = (u_model * a_position).xyz;
}