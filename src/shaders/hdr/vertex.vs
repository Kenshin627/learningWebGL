#version 300 es
in vec4 a_position;
in vec3 a_normal;
in vec2 a_texcoord;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoords;


uniform mat4 u_projection;
uniform mat4 u_view;
uniform mat4 u_model;

uniform bool inverse_normals;

void main()
{
    FragPos = vec3(u_model * a_position);   
    TexCoords = a_texcoord;
    
    vec3 n = -a_normal;
    
    mat3 normalMatrix = transpose(inverse(mat3(u_model)));
    Normal = normalize(normalMatrix * n);
    
    gl_Position = u_projection * u_view * u_model * a_position;
}