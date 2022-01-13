export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export interface CursorOffset {
  line: number
  ch: number
  amount: number
}

export type CursorOffsets = Array<CursorOffset>
