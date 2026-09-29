import React from 'react';
import TeamColorStripe from '../common/TeamColorStripe';
import { useDriverHref } from '../../hooks/useDriverHref';
import type { PodiumEntry } from '../../types/track';

// Read-only twin of <DriverCard> (which is Redux/DnD-coupled): same flat card,
// left team stripe, UPPERCASE last name + team beneath — exactly the grid cards.
// Shared by the desktop matrix (TrackResultsIsland) and the mobile carousel
// (MobileTrackResults).
const TrackDriverCard: React.FC<{ entry?: PodiumEntry }> = ({ entry }) => {
  const driverHref = useDriverHref();
  if (!entry) return <div className="race-slot h-full w-full" aria-hidden="true" />;
  const href = driverHref(entry.driverId);
  const team = { color: entry.teamColor, secondaryColor: entry.teamSecondaryColor };
  return (
    <div className="grid-card-wrapper">
      <div className="driver-card h-full" style={{ paddingLeft: '10px', cursor: 'default' }}>
        <TeamColorStripe team={team} widthPx={4} />
        <div className="flex flex-col ml-1 flex-grow min-w-0">
          {href ? (
            <a href={href} className="text-xs font-bold truncate hover:underline" title={entry.driverName}>
              {entry.driverLast.toUpperCase()}
            </a>
          ) : (
            <span className="text-xs font-bold truncate">{entry.driverLast.toUpperCase()}</span>
          )}
          <span className="text-2xs text-ink-muted leading-tight truncate">{entry.teamName}</span>
        </div>
      </div>
    </div>
  );
};

export default TrackDriverCard;
