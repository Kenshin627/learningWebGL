type attr = {
    key: string;
    size: number;
    offset: number;
}

type uniform = {
    key: string;
    func: string;
     data: any
}

export class Geometry {
    public attris: attr[];
    public vertices: number[];
    public stride: number;
    public uniforms: uniform[];
    constructor(vertces: number[], attris: attr[], stride: number, uniforms: uniform[]){
        this.vertices = vertces;
        this.attris = attris;
        this.stride = stride;
        this.uniforms = uniforms;
    }
}