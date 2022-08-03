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
    sampler2D dsampler;
    sampler2D ssampler;
    sampler2D normalSampler;
};

in vec2 texcoord;
in vec3 position;
in vec3 normal;
in mat3 tbn;

out vec4 outColor;

uniform Light light;
uniform Material material;
uniform vec3 view_position;
// uniform sampler2D sampler;

void main(){
    vec3 tnormal = (texture(material.normalSampler, texcoord)).rgb;
    tnormal = normalize(tnormal * 2.0 - 1.0);
    // tnormal = normalize(tbn * tnormal);

    vec3 diffuse = max(0.0, dot(light.dir, tnormal)) * material.diffuse;
    vec3 viewDir = normalize(view_position - position);
    vec3 reflectDir = reflect(-light.dir, normal);
    vec3 specular = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess) * material.specular;
    vec4 c = vec4((material.ambient + diffuse + specular) *  light.intensity , 1.0);
    // outColor = texture(material.dsampler, texcoord) * c;
    outColor = vec4(1.0 ,1.0, 1.0, 1.0) * c;
    // outColor = vec4(tnormal, 1.0);
}