/**
 * @param {number} min - the lower bound
 * @param {number} max - the upper bound
 * @return {number} the randomly generated integer
 */
export default function rngInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
