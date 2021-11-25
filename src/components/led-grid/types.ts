export interface ILEDGridProps {
  dimensions?: number
  speed?: number
  isInteractive?: boolean
  renderPattern?: 'random' | 'waterfall' | 'flip'
}

export type LEDMatrixType = (number[])[];

export interface IColorGroup {
  color: string,
  cells: LEDMatrixType
}
