import {IColorOptions} from './types';

/**
 * Generates a random number within specified range.
 * Default range is between 0 - 100.
 *
 * @param {number} min - the lower bound
 * @param {number} max - the upper bound
 * @return {number} the randomly generated integer
 */
const rng = (min: number = 0, max: number = 100): number => (
  Math.floor(Math.random() * (max - min + 1) + min)
);

/**
 * Converts a decimal number to a hexadecimal string
 *
 * @param {number} number - number to convert
 * @return {string} the hexadecimal value produced
 */
const convertDecToHexString = (number: number): string => {
  let num = number;
  if (num > 15) num = 15;
  else if (num < 0) num = 0;
  return num >= 10 ? String.fromCharCode(65 + (num - 10)) : `${num}`;
};


/**
 * Generates a random color as either with a hexadecimal string
 *
 * @param {'hex' | 'dec'} type - the color representation to generate
 * @param {number} alpha - the opacity of the color
 * @return {string} the decimal or hexadecimal color string produced
 */
const generateColor = ({
  type = 'rgb',
  r,
  g,
  b,
  a = 1,
} : IColorOptions = {}): string => {
  switch (type) {
  case 'hex':
    /* 'hex' works with string values of r,g,b */
    return `#${
      r ? `${r}`[0] : convertDecToHexString(rng(0, 15))}${
      r ? `${r}`[1] : convertDecToHexString(rng(0, 15))}${
      g ? `${g}`[0] : convertDecToHexString(rng(0, 15))}${
      g ? `${g}`[1] : convertDecToHexString(rng(0, 15))}${
      b ? `${b}`[0] : convertDecToHexString(rng(0, 15))}${
      b ? `${b}`[1] : convertDecToHexString(rng(0, 15))}${
      convertDecToHexString((a / 1) * 15)}${
      convertDecToHexString((a / 1) * 15)}`;

  /* 'hsl' and 'rgb' work with number values of r,g,b */
  case 'hsl':
    return (
      `hsla(${
        typeof r === 'number' ? r : rng(0, 255)},${
        typeof g === 'number' ? g : rng(0, 255)},${
        typeof b === 'number' ? b : rng(0, 255)},${
        a})`
    );

  case 'rgb':
  default:
    return (
      `rgba(${
        typeof r === 'number' ? r : rng(0, 255)},${
        typeof g === 'number' ? g : rng(0, 255)},${
        typeof b === 'number' ? b : rng(0, 255)},${
        a})`
    );
  }
};

const HELPERS = {
  rng,
  generateColor,
};

export default HELPERS;
