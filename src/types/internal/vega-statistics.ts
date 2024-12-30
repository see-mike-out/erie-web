declare module 'vega-statistics' {
  // Define types for the library's exports here
  export function randomKDE(arg1: number[], arg2?: number | undefined): { pdf: (a0: number) => number, cdf: (a0: number) => number };
  export function sampleCurve(arg1: (a0: number) => number, arg2: any[], arg3: number, arg4: number): Array<[number, number]>;
}