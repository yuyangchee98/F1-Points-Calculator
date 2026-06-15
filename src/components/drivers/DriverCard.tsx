import React from 'react';
import { useSelector } from 'react-redux';
import type { Driver } from '../../types';
import { selectTeamsByIdMap, getDriverLastName, getDriverDisplayName } from '../../store/selectors/dataSelectors';
import { useDriverDrag } from '../../hooks/useDriverDragDrop';
import { getContrastText, teamFillStyle } from '../../utils/color';
import TeamColorStripe from '../common/TeamColorStripe';

interface DriverCardProps {
  driver: Driver;
  isOfficialResult?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  raceId?: string;
  position?: number;
  hideCode?: boolean;
  overrideTeamId?: string | null;
}

const DriverCard: React.FC<DriverCardProps> = ({
  driver,
  isOfficialResult = false,
  isSelected = false,
  onClick,
  raceId,
  position,
  hideCode = false,
  overrideTeamId
}) => {
  const teamById = useSelector(selectTeamsByIdMap);

  const teamId = overrideTeamId || driver.team;
  const team = teamById[teamId];

  const { drag, isDragging } = useDriverDrag(driver.id, raceId, position);

  return (
    <div
      ref={drag}
      className={`
        driver-card flex items-center justify-between rounded-md overflow-hidden
        ${isSelected ? 'selected' : ''}
        ${isOfficialResult ? 'official-result-styling' : ''}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      data-driver-id={driver.id}
      data-driver-name={`${driver.givenName} ${driver.familyName}`}
      data-team={driver.team}
      onClick={onClick}
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        'aria-pressed': isSelected,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        },
      })}
      style={{
        // 6px base padding (px-1.5) + 4px to clear the stripe, matching the
        // old 4px left border's layout offset.
        paddingLeft: '10px',
        cursor: 'grab'
      }}
    >
      <TeamColorStripe team={team} widthPx={4} />
      <div className="flex flex-col ml-1 flex-grow min-w-0">
        <span className="text-xs font-bold flex items-center gap-1">
          {getDriverDisplayName(driver)}
        </span>
        <span className="text-2xs text-ink-muted leading-tight">
          {team?.name || driver.team}
        </span>
      </div>

      {!hideCode && (
        <div
          className="flex-shrink-0 text-xs font-bold py-1 px-2 rounded-sm mr-2"
          style={{
            ...teamFillStyle(team),
            color: getContrastText(team?.color || '#555'),
            minWidth: '40px',
            textAlign: 'center'
          }}
        >
          {getDriverLastName(driver.id).slice(0, 3).toUpperCase()}
        </div>
      )}

    </div>
  );
};

export default DriverCard;