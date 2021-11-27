import {RENDER_PALETTE, RENDER_PATTERNS} from '../../utils/constants';

export type RenderPatternTypes = (typeof RENDER_PATTERNS)[
  keyof typeof RENDER_PATTERNS
];

export type RenderPaletteTypes = (typeof RENDER_PALETTE)[
  keyof typeof RENDER_PALETTE
];

export interface ILEDGridProps {
  dimensions?: number
  speed?: number
  isInteractive?: boolean
  renderPattern?: RenderPatternTypes
  renderPalette?: RenderPaletteTypes
  padding?: number
}

export type LEDMatrixType = (number[])[];

export interface IColorGroup {
  color: string,
  cells: LEDMatrixType
}
