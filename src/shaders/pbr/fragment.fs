#version 300 es
precision highp float;

uniform vec3 albedo;
uniform float metallic;
uniform float roughness;
uniform float ao;
uniform vec3 lightPositions[4];
uniform vec3 lightColors[4];
uniform vec3 camPos;


in vec2 texcoord;
in vec3 fragPos;
in vec3 normal;

out vec4 FragColor;

const float PI = 3.14159265358979;

float DistributionGGX(vec3 N, vec3 H, float roughness);
float GeometrySchlickGGX(float NdotV, float roughness);
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness);
vec3 fresnelSchlick(float cosTheta, vec3 FO);

void main() {
    vec3 N = normalize(normal);
    vec3 V = normalize(camPos - fragPos);

    vec3 FO = vec3(0.04);
    FO = mix(FO, albedo, metallic);

    vec3 Lo = vec3(0.0);
    for(int i = 0; i < 4; i++) {

        //radiance
        vec3 L = normalize(lightPositions[i] - fragPos);
        vec3 H = normalize(L + V);
        float distance = length(lightPositions[i] - fragPos);
        float attenuation = 1.0 / distance * distance;
        vec3 radiance = lightColors[i]  * attenuation;

        //cook-torrance BRDF
        float NDF = DistributionGGX(N, H, roughness);
        float G = GeometrySmith(N, V, L, roughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), FO);

        vec3 ks = F;
        vec3 kd = vec3(1.0) - ks;
        kd *= 1.0 - metallic;

        vec3 numerator = NDF * G * F;
        float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.000001;
        vec3 specular = numerator / denominator;
        float NdotL = max(dot(N, L), 0.0);
        Lo += (kd * albedo / PI + specular) * radiance * NdotL;
    }

    vec3 ambient = vec3(0.03) * albedo * ao;
    vec3 color = ambient + Lo;
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0/2.2));
    FragColor = vec4(color, 1.0);
    // FragColor = vec4(1.0,1.0,1.0,1.0);
}

float DistributionGGX(vec3 N, vec3 H, float roughness){
    float a2 = roughness * roughness;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float nom = a2;
    float denom = NdotH2 * ( a2 - 1.0) + 1.0;
    denom = PI * denom * denom;
    return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
    float r = roughness + 1.0;
    float k = r * r / 8.0;
    float nom = NdotV;
    float denom = NdotV * (1.0 - k) + k;
    // return NdotV / (NdotV * (1.0 -k) + k);
    return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    return GeometrySchlickGGX(max(dot(N, V), 0.0), roughness) *
            GeometrySchlickGGX(max(dot(N, L), 0.0), roughness);
}

vec3 fresnelSchlick(float cosTheta, vec3 FO) {
    return FO + (1.0 - FO) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

