// ---------------------------------------------------------------------------
// SVG Sector Geometry Utilities
// Pure coordinate math for the EOS wheel – no React dependencies.
// ---------------------------------------------------------------------------

const SVG_W = 500;
const CX = 250;
const CY = 250;
const R1 = 78; // inner radius
const R2 = 232; // outer radius
const GAP = 2; // degrees gap between sectors

export const SVG_CONSTANTS = { SVG_W, CX, CY, R1, R2, GAP } as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toRad = (d: number): number => (d * Math.PI) / 180;

/** Convert a polar angle (degrees) + radius to an SVG [x, y] point. */
const polarToXY = (angleDeg: number, r: number): [number, number] => [
  CX + r * Math.cos(toRad(angleDeg)),
  CY + r * Math.sin(toRad(angleDeg)),
];

/** Interpolate between R1 and R2 by fraction `frac` (0 = inner, 1 = outer). */
const radiusAt = (frac: number): number => R1 + (R2 - R1) * frac;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build an SVG `<path d="…">` string for a sector arc.
 *
 * GAP degrees are added inward from each edge so adjacent sectors don't touch.
 */
export function makeSectorPath(startAngle: number, endAngle: number): string {
  const s = startAngle + GAP;
  const e = endAngle - GAP;

  const sweep = e - s;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;

  const [ix1, iy1] = polarToXY(s, R1);
  const [ix2, iy2] = polarToXY(e, R1);
  const [ox1, oy1] = polarToXY(e, R2);
  const [ox2, oy2] = polarToXY(s, R2);

  return [
    `M ${ix1} ${iy1}`,
    `A ${R1} ${R1} 0 ${largeArc} 1 ${ix2} ${iy2}`,
    `L ${ox1} ${oy1}`,
    `A ${R2} ${R2} 0 ${largeArc} 0 ${ox2} ${oy2}`,
    "Z",
  ].join(" ");
}

/**
 * Position for a text label inside a sector.
 *
 * @param centerAngle – midpoint angle of the sector (degrees)
 * @param frac – fraction between inner and outer radius (default 0.54)
 */
export function labelPosition(
  centerAngle: number,
  frac: number = 0.54,
): [number, number] {
  return polarToXY(centerAngle, radiusAt(frac));
}

/**
 * Position for a badge icon inside a sector.
 *
 * Multiple badges are spread perpendicular to the radial axis so they
 * don't overlap.
 *
 * @param centerAngle – midpoint angle of the sector (degrees)
 * @param index       – zero-based index of this badge
 * @param total       – total number of badges in the sector
 */
export function badgePosition(
  centerAngle: number,
  index: number,
  total: number,
): [number, number] {
  const r = radiusAt(0.82);
  const [bx, by] = polarToXY(centerAngle, r);

  const offset = (index - (total - 1) / 2) * 22;
  const angleRad = toRad(centerAngle);

  return [
    bx + offset * -Math.sin(angleRad),
    by + offset * Math.cos(angleRad),
  ];
}

/**
 * Center point of a sector – used as the animation target for flying nodes.
 *
 * @param centerAngle – midpoint angle of the sector (degrees)
 */
export function sectorCenterPoint(centerAngle: number): {
  x: number;
  y: number;
} {
  const [x, y] = polarToXY(centerAngle, radiusAt(0.62));
  return { x, y };
}

/**
 * Convert an SVG-space sector center to screen (viewport) pixels.
 *
 * Reads the bounding rect of the given `<svg>` element and applies the
 * scale factor so the returned coordinates match `getBoundingClientRect()`
 * space, which is what Framer Motion and FLIP animations expect.
 */
export function svgPointToScreen(
  svgEl: SVGSVGElement,
  sectorCenterAngle: number,
): { x: number; y: number } {
  const pt = sectorCenterPoint(sectorCenterAngle);
  const rect = svgEl.getBoundingClientRect();
  const scale = rect.width / SVG_W;

  return {
    x: rect.left + pt.x * scale,
    y: rect.top + pt.y * scale,
  };
}
