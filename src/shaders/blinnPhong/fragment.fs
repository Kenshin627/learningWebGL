#version 300 es
precision highp float;
in vec4 v_color;
in vec2 texcoord;
in vec3 position;
in vec3 normal;

out vec4 outColor;

uniform vec3 view_position;
uniform vec3 u_lightDir;
uniform vec3 u_lightColor;
uniform float u_lightIntensity;
uniform float u_ambient;
uniform sampler2D sampler;

void main(){
    float diffuse = max(0.0, dot(u_lightDir, normal));
    vec3 viewDir = normalize(view_position - position);
    vec3 reflectDir = reflect(-u_lightDir, normal);
    float specular = pow(max(dot(viewDir, reflectDir), 0.0), 64.0) * 3.0;
    vec4 c = vec4(u_lightColor * (diffuse + u_ambient + specular) * u_lightIntensity , 1.0);
    outColor = texture(sampler, texcoord) * c;
}