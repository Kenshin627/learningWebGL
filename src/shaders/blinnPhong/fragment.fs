#version 300 es
precision highp float;

struct Light {
    vec3 dir;
    vec3 color;
    float intensity;
};

struct Material {
    vec3 diffuse;
    vec3 ambient;
    vec3 specular;
    float shininess;
};

in vec4 v_color;
in vec2 texcoord;
in vec3 position;
in vec3 normal;

out vec4 outColor;

uniform Light light;
uniform Material material;
uniform vec3 view_position;
uniform float u_ambient;
uniform sampler2D sampler;

void main(){
    vec3 diffuse = max(0.0, dot(light.dir, normal)) * material.diffuse;
    vec3 viewDir = normalize(view_position - position);
    vec3 reflectDir = reflect(-light.dir, normal);
    vec3 specular = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess) * 3.0 * material.specular;
    vec4 c = vec4((material.ambient + diffuse + specular) *  light.intensity , 1.0);
    outColor = texture(sampler, texcoord) * c;
}