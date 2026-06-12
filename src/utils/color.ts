/**
 * Pick black or white text for a given background color using YIQ
 * perceived luminance. Team colors arrive from the API at runtime, so
 * contrast has to be computed, not designed.
 */
export function getContrastText(hexcolor: string | undefined | null): string {
  if (!hexcolor || !hexcolor.startsWith('#')) {
    return '#ffffff';
  }

  let r, g, b;
  if (hexcolor.length === 4) {
    r = parseInt(hexcolor[1] + hexcolor[1], 16);
    g = parseInt(hexcolor[2] + hexcolor[2], 16);
    b = parseInt(hexcolor[3] + hexcolor[3], 16);
  } else if (hexcolor.length === 7) {
    r = parseInt(hexcolor.substring(1, 3), 16);
    g = parseInt(hexcolor.substring(3, 5), 16);
    b = parseInt(hexcolor.substring(5, 7), 16);
  } else {
    return '#ffffff';
  }

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}
