import React from 'react';

interface TeamColorFields {
  color?: string;
  secondaryColor?: string;
}

interface TeamColorStripeProps {
  team: TeamColorFields | undefined | null;
  widthPx?: number;
}

// Left-edge team color stripe rendered as an absolutely-positioned child so it
// inherits the parent's rounded corners via the parent's `overflow: hidden`.
//
// We can't draw this on the card itself: a solid `border-left` rounds correctly
// but only takes one color, while a two-tone `border-image` or background
// gradient stripe can't be clipped to the rounded corner (border-image ignores
// border-radius entirely; a narrow left background isn't rounded cleanly), so
// the colored edge pokes past the card's rounded corner as a square nub.
// Clipping a child element sidesteps all of that.
//
// The parent MUST be `position: relative` and `overflow: hidden` with the same
// border-radius it wants the stripe to follow.
const TeamColorStripe: React.FC<TeamColorStripeProps> = ({ team, widthPx = 4 }) => {
  const color = team?.color || '#ccc';
  const background = team?.secondaryColor
    ? `linear-gradient(to bottom, ${color} 50%, ${team.secondaryColor} 50%)`
    : color;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: widthPx,
        background,
        pointerEvents: 'none',
      }}
    />
  );
};

export default TeamColorStripe;
