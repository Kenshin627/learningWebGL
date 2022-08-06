#version 300 es
precision highp float;


in vec3 position;
in vec3 normal;
in vec2 texcoord;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 hdrColor;
uniform vec3 lightColor;

void main()
{           
    fragColor = vec4(lightColor, 1.0);
    float brightness = dot(fragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
       if(brightness > 1.0)
        hdrColor = vec4(fragColor.rgb, 1.0);
	else
		hdrColor = vec4(0.0, 0.0, 0.0, 1.0);
}