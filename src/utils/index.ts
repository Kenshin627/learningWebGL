export function checkArrayVaildate(arg: any): boolean{
    return arg && Array.isArray(arg) && arg.length;
}