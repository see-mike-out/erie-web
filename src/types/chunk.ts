export interface DataChunkObject {
    // chunk type: 1 min, 10 data points, etc
    type: string,
    // summarize type: mean, median, min/max
    summarize: string
}