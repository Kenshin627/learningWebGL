#version 300 es
precision highp float;
in vec3 position;
in vec3 normal;
in vec2 texcoord;
struct Light {
    vec3 Position;
    vec3 Color;
};
uniform sampler2D diffuseTexture;
uniform Light lights[4];
out vec4 fragColor;

void main(){
    vec3 f_color = texture(diffuseTexture, texcoord).rgb;
    vec3 f_normal = normalize(normal);
    vec3 lighting = vec3(0.0);
    for(int i = 0; i < 4; i++) {
        vec3 lightDir = normalize(lights[i].Position - position);
        float diffuse = max(dot(lightDir, f_normal), 0.0);
        vec3 result = diffuse * f_color * lights[i].Color;
        float distance = length(position - lights[i].Position);
        result *= 1.0 /  distance;
        lighting += result;
    }
    fragColor = vec4(lighting, 1.0);
}