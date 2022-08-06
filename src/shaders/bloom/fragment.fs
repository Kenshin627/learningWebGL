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
layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 hdrColor;

void main(){
    vec3 f_color = texture(diffuseTexture, texcoord).rgb;
    vec3 f_normal = normalize(normal);
    vec3 lighting = vec3(0.0);
    vec3 ambinet = vec3(0.2, 0.2, 0.2);
    for(int i = 0; i < 4; i++) {
        vec3 lightDir = normalize(lights[i].Position - position);
        float diffuse = max(dot(lightDir, f_normal), 0.0);
        vec3 result = diffuse * f_color * lights[i].Color;
        float distance = length(position - lights[i].Position);
        result *= 1.0 /  (distance * distance);
        lighting += result;
    }
    vec3 rr = lighting;
    float brightness = dot(rr, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 1.0) {
        hdrColor = vec4(rr, 1.0);
    }else {
        hdrColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    fragColor = vec4(rr, 1.0);
}