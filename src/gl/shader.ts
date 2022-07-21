export class ShaderFactory {
    static createShader (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
        let shader = gl.createShader(type) as WebGLShader;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        gl.deleteShader(shader);
        throw new Error(`error:${ gl.getShaderInfoLog(shader) }`);
    }
}