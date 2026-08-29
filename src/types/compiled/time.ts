export type BeatObject = {
  converter: (a: number) => number,
  roundStart?: <T>(a: T) => T,
  roundDuration?: <T>(a: T) => T
}