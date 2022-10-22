import { Nullable } from "../types";
import { vec3, vec4, mat4 } from "gl-matrix";

export class Shader {
    public vertexCode: string = "";
    public fragmentCode: string = "";
    private _ctx: WebGL2RenderingContext;
    private _program: Nullable<WebGLProgram> = null;
    constructor(ctx: WebGL2RenderingContext){
        this._ctx = ctx;
    }

    get program() {
        return this._program;
    }

    /**
     * 读取shader
     * @param { string } path 
     */
    async readShader(path: string) {
        try {
            this.vertexCode = await (await fetch(`${path}/vertex.vs`)).text();
            this.fragmentCode = await (await fetch(`${path}/fragment.fs`)).text();
            return this;
        } catch (error) {
            throw new Error(`read shader Error: ${error}`);
            
        }
    }

    compilerShader() {
        //vertex
        let vertex = this._ctx.createShader(this._ctx.VERTEX_SHADER) as WebGLShader;
        this._ctx.shaderSource(vertex, this.vertexCode);
        this._ctx.compileShader(vertex);
        
        //fragment
        let fragment = this._ctx.createShader(this._ctx.FRAGMENT_SHADER) as WebGLShader;
        this._ctx.shaderSource(fragment, this.fragmentCode);
        this._ctx.compileShader(fragment);

        const vertexSuccess = this._ctx.getShaderParameter(vertex, this._ctx.COMPILE_STATUS);
        const fragmentSuccess = this._ctx.getShaderParameter(fragment, this._ctx.COMPILE_STATUS);        
        const vertexErr = this._ctx.getShaderInfoLog(vertex);
        const fragmentErr = this._ctx.getShaderInfoLog(fragment);

        if (vertexSuccess && fragmentSuccess) {
            const program = this._program = this._ctx.createProgram() as WebGLProgram;
            this._ctx.attachShader(program, vertex);
            this._ctx.attachShader(program, fragment);
            this._ctx.linkProgram(program);
            const success = this._ctx.getProgramParameter(program, this._ctx.LINK_STATUS);
            if (!success) {   
                this._ctx.deleteShader(vertex);
                this._ctx.deleteShader(fragment);             
                this._ctx.deleteProgram(program);
                throw new Error(`error: ${ this._ctx.getProgramInfoLog(program) }`);
            }
            return this;
            
        }else {
            this._ctx.deleteShader(vertex);
            this._ctx.deleteShader(fragment);
            throw new Error(`compiler shader Error:${vertexErr}, ${fragmentErr}`)
        }
    }

    setFloat(name: string, val: number){
        const uniformLocation = this._ctx.getUniformLocation(this.program as WebGLProgram, name);
        if (uniformLocation) {
            this._ctx.uniform1f(uniformLocation, val);
        }
    }

    setVec3(name: string, val: vec3) {
        const uniformLocation = this._ctx.getUniformLocation(this.program as WebGLProgram, name);
        if (uniformLocation) {
            this._ctx.uniform3f(uniformLocation, val[0], val[1], val[2]);
        }
    }

    setVec4(name: string, val: vec4) {
        const uniformLocation = this._ctx.getUniformLocation(this.program as WebGLProgram, name);
        if (uniformLocation) {
            this._ctx.uniform4f(uniformLocation, val[0], val[1], val[2], val[3]);
        }
    }

    setMatrix4x4(name: string, matrix: mat4) {
        const uniformLocation = this._ctx.getUniformLocation(this.program as WebGLProgram, name);
        if (uniformLocation) {
            this._ctx.uniformMatrix4fv(uniformLocation, false, matrix);
        }
    }

    setInt(name: string, val: number) {
        const uniformLocation = this._ctx.getUniformLocation(this.program as WebGLProgram, name);
        if (uniformLocation) {
            this._ctx.uniform1i(uniformLocation, val);
        }
    }

    use() {
        if (this._program) {
            this._ctx.useProgram(this._program);
        }
    }

    dispose(){
        if (this._program) {
            this._ctx.deleteProgram(this._program);
        }
    }
}