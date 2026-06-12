import React from 'react';
import { useSelector } from 'react-redux';
import type { DriverStanding } from '../../types';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { getContrastText } from '../../utils/color';

interface PositionColumnProps {
  position: number;
  mode?: 'position' | 'standings';
  standings?: DriverStanding[];
  style?: React.CSSProperties;
}

const PositionColumn: React.FC<PositionColumnProps> = ({ position, mode = 'position', standings = [], style }) => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  const standingDriver = mode === 'standings' && standings[position - 1];
  const driver = standingDriver ? driverById[standingDriver.driverId] : null;
  const team = driver ? teamById[driver.team] : null;
  // Light team colors (e.g. Haas white) are unreadable on the light pill —
  // fall back to default ink when the color expects a dark background
  const rawTeamColor = team?.color || '#666666';
  const teamColor = getContrastText(rawTeamColor) === '#ffffff' ? rawTeamColor : 'rgb(var(--text-primary))';

  const isPodium = mode === 'position' && position <= 3;

  return (
    <div
      className={`position sticky left-0 z-sticky flex items-center justify-center ${isPodium ? 'position-podium' : ''}`}
      data-position={position}
      title={mode === 'standings' && driver && standingDriver ? `${driver.givenName} ${driver.familyName} - ${standingDriver.points} pts` : `Position ${position}`}
      style={style}
    >
      {mode === 'position' ? (
        <span className="font-bold">{position}</span>
      ) : (
        <div className="flex flex-col items-center justify-center py-1">
          <span className="text-2xs text-ink-muted font-semibold tnum">{position}</span>
          {driver && (
            <>
              <span
                className="text-xs font-bold"
                style={{ color: teamColor }}
              >
                {getDriverLastName(driver.id).slice(0, 3).toUpperCase()}
              </span>
              <span className="text-2xs font-semibold text-ink-secondary tnum">
                {standingDriver && standingDriver.points}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(PositionColumn);