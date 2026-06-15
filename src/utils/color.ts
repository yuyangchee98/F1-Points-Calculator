import type { CSSProperties } from 'react';

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
// 50/50 top/bottom split via linear-gradient. Horizontal works at both wide
// chips (avatars) and thin tall stripes (standings bars) without losing either
// half. Keep chart lines and small dots on the primary color alone.
export function teamFillStyle(team: TeamColorFields | undefined | null): { background: string } {
  if (!team || !team.color) return { background: '#ccc' };
  if (team.secondaryColor) {
    return {
      background: `linear-gradient(to bottom, ${team.color} 50%, ${team.secondaryColor} 50%)`,
    };
  }
  return { background: team.color };
}

// Left-edge stripe via border-image so a 3-4px borderLeft can show two-tone
// without restructuring the parent into a flex/absolute layout. Falls back to
// solid borderLeft when no secondary color.
//
// Note: border-image applies to all four borders by default. The
// `/ 0 0 0 Npx` constrains border-image-width so only the left edge draws —
// otherwise the gradient bleeds across top/right/bottom as visible stripes.
export function teamLeftBorderStyle(
  team: TeamColorFields | undefined | null,
  widthPx: number
): CSSProperties {
  const color = team?.color || '#ccc';
  if (team?.secondaryColor) {
    return {
      borderLeft: `${widthPx}px solid transparent`,
      borderImage: `linear-gradient(to bottom, ${color} 50%, ${team.secondaryColor} 50%) 1 / 0 0 0 ${widthPx}px`,
    };
  }
  return { borderLeft: `${widthPx}px solid ${color}` };
}
