declare module 'replicate' {
  export default class Replicate {
    constructor(options: { auth: string });
    run<T = any>(model: any, options: any): Promise<T>;
  }
}















