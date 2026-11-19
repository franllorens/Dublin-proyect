/** Deterministic jitter, so server and client render the same "hand-placed" letters. */
export function jitter(i: number, seed = 1) {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x); // 0..1
}
