
export type TableHead = {
    name: string,
    filedName: string
};
const  head = [
    { name: 'test', filedName: 't1' },
    { name: 'test', filedName: 't2' },
    { name: 'test', filedName: 't3' },
    { name: 'test', filedName: 't4' },
    { name: 'test', filedName: 't5' },
] as const;

type headT = typeof head[number];

type extractT<T> = T extends [infer First, ...infer Rest] ? [ keyof {[k in keyof First as k extends 'filedName'? First[k]: "123" ]: any},...extractT<Rest>]: [];

type fff = extractT<headT>;