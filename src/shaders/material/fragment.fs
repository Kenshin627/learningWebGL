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
    sampler2D esampler;
};

in vec4 v_color;
in vec2 texcoord;
in vec3 position;
in vec3 normal;

out vec4 outColor;

uniform Light light;
uniform Material material;
uniform vec3 view_position;
// uniform sampler2D sampler;

void main(){
    vec3 viewDir = normalize(view_position - position);
    vec3 reflectDir = reflect(-light.dir, normal);

    vec3 diffuseTexture = vec3(texture(material.dsampler, texcoord));
    vec3 specularTexture = vec3(texture(material.ssampler, texcoord));

    //ambient
    vec3 ambient = material.ambient * diffuseTexture;
    //diffuse
    vec3 diffuse = max(0.0, dot(light.dir, normal)) * material.diffuse * diffuseTexture;
    //specular
    vec3 specular = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess) * specularTexture;

    outColor = vec4((ambient + diffuse + specular) * light.intensity, 1.0);
}