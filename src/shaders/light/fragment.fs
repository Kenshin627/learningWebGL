#version 300 es
precision highp float;


in vec3 position;
in vec3 normal;
in vec2 texcoord;

out vec4 FragColor;

uniform vec3 lightColor;

void main()
{           
    FragColor = vec4(lightColor, 1.0);
}