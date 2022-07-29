#version 300 es
precision highp float;

out vec4 outColor;
uniform vec3 lineColor;

void main() {
    outColor = vec4(lineColor, 1.0);
}