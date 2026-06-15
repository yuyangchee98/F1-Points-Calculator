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

interface TeamColorFields {
  color?: string;
  secondaryColor?: string;
}

// Render a team's color as a solid fill or — when a secondary color is set — a
// 50/50 vertical split via linear-gradient. Use on surfaces wide enough to read
// two halves (~16px+); keep thin borders, dots, and chart lines on the primary
// color alone.
export function teamFillStyle(team: TeamColorFields | undefined | null): { background: string } {
  if (!team || !team.color) return { background: '#ccc' };
  if (team.secondaryColor) {
    return {
      background: `linear-gradient(to right, ${team.color} 50%, ${team.secondaryColor} 50%)`,
    };
  }
  return { background: team.color };
}
