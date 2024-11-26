declare module 'vega-statistics' {
  // Define types for the library's exports here
  export function randomKDE(arg1: number[], arg2?: number | undefined): { pdf: (number) => number, cdf: (number) => number };
  export function sampleCurve(arg1: (number) => number, arg2: any[], arg3: number, arg4: number): Array<[number, number]>;
}