export class Program {
    static create(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        let program = gl.createProgram();
        if (!program) {
            throw new Error(`err: create program error`);
        }
        else {
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            const success = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (success) {
                return program;
            }
            gl.deleteProgram(program);
            throw new Error(`error: ${ gl.getProgramInfoLog(program) }`);
        }
    }
}