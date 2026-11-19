/** Hatch geometry, shared by the server-rendered SVG and the client animation. */
const HINGE_Y = 70;
const HX1 = 122;
const HX2 = 330;
const H = 104;

export function hatchPath(deg: number) {
  const a = (deg * Math.PI) / 180;
  const y2 = HINGE_Y + H * Math.cos(a);
  const e = 11 * Math.sin(a);
  return `M${HX1} ${HINGE_Y} L${HX2} ${HINGE_Y} L${HX2 + e} ${y2.toFixed(2)} L${HX1 - e} ${y2.toFixed(2)} Z`;
}

export function edgePath(deg: number) {
  // thin outer-face band along the free edge, only visible once the hatch is past vertical
  const a = (deg * Math.PI) / 180;
  const y2 = HINGE_Y + H * Math.cos(a);
  const e = 11 * Math.sin(a);
  const t = Math.max(0, -Math.cos(a)) * 4 + 1.2;
  return `M${HX1 - e} ${y2.toFixed(2)} L${HX2 + e} ${y2.toFixed(2)} L${HX2 + e} ${(y2 - t).toFixed(2)} L${HX1 - e} ${(y2 - t).toFixed(2)} Z`;
}

