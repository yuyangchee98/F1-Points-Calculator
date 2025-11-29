import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Race } from '../../types';
import { RootState } from '../../store';
import { selectDriverAtPosition, selectDriversByIdMap, getDriverLastName, getDriverDisplayName } from '../../store/selectors/dataSelectors';
import DriverCard from '../drivers/DriverCard';
import { selectDriver, copyDriver } from '../../store/slices/uiSlice';
import { placeDriver, clearPosition, fillRestOfSeason, resetGrid, clearEverything, setFastestLap } from '../../store/slices/gridSlice';
import { selectDriverStandings } from '../../store/selectors/resultsSelectors';
import { useAppDispatch } from '../../store';
import { useDriverDrop } from '../../hooks/useDriverDragDrop';
import { useContextMenu, useLongPress } from '../../hooks/useContextMenu';
import ContextMenu from '../common/ContextMenu';
import { ContextMenuItem } from '../../types/contextMenu';
import { toastService } from '../common/ToastContainer';
import { trackContextMenuAction } from '../../utils/analytics';
import { hasFastestLapPoint, getActiveSeason } from '../../utils/constants';

interface RaceColumnProps {
  race: Race;
  position: number;
}

const RaceColumn: React.FC<RaceColumnProps> = ({ race, position }) => {
  const dispatch = useAppDispatch();
  const driverId = useSelector((state: RootState) =>
    selectDriverAtPosition(state, race.id, position)
  );
  const selectedDriverId = useSelector((state: RootState) => state.ui.selectedDriver);
  const copiedDriverId = useSelector((state: RootState) => state.ui.copiedDriver);
  const positions = useSelector((state: RootState) => state.grid.positions);
  const driverById = useSelector(selectDriversByIdMap);
  const driverStandings = useSelector(selectDriverStandings);
  const races = useSelector((state: RootState) => state.seasonData.races);

  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevDriverId, setPrevDriverId] = useState<string | null>(null);

  const contextMenu = useContextMenu();

  const { drop, isOver, canDrop } = useDriverDrop({
    raceId: race.id,
    position,
  });

  useEffect(() => {
    if (driverId && driverId !== prevDriverId) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevDriverId(driverId);
  }, [driverId, prevDriverId]);

  const gridPosition = positions.find(p =>
    p.raceId === race.id && p.position === position
  );
  const isOfficialResult = gridPosition?.isOfficialResult || false;

  const driver = driverId ? driverById[driverId] : null;

  const buildContextMenuItems = (): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    if (driverId && driver) {
      items.push({
        id: 'copy',
        label: 'Copy Driver',
        icon: '📋',
        onClick: () => {
          dispatch(copyDriver(driverId));
          toastService.addToast(`Copied ${getDriverDisplayName(driver)}`, 'info');
          trackContextMenuAction('ACTION', 'copy_driver');
        },
      });

      if (hasFastestLapPoint(getActiveSeason())) {
        const hasFastestLap = gridPosition?.hasFastestLap || false;
        if (!hasFastestLap) {
          items.push({
            id: 'fastest-lap',
            label: 'Set Fastest Lap',
            icon: '⚡',
            onClick: () => {
              dispatch(setFastestLap({
                raceId: race.id,
                driverId: driverId
              }));
              toastService.addToast(
                `Set fastest lap for ${getDriverDisplayName(driver)}`,
                'info'
              );
              trackContextMenuAction('ACTION', 'set_fastest_lap');
            },
          });
        }
      }

      if (!isOfficialResult) {
        items.push({
          id: 'remove',
          label: 'Remove Driver',
          icon: '✕',
          onClick: () => {
            dispatch(clearPosition({ raceId: race.id, position }));
            toastService.addToast(`Removed ${getDriverDisplayName(driver)} from P${position}`, 'info');
            trackContextMenuAction('ACTION', 'remove_driver');
          },
        });

        items.push({
          id: 'fill-rest',
          label: 'Repeat for Remaining Races',
          icon: '📅',
          onClick: () => {
            const raceIds = races.map(r => r.id);
            dispatch(fillRestOfSeason({
              driverId,
              position,
              startRaceId: race.id,
              raceIds,
            }));

            const remainingCount = raceIds.slice(raceIds.indexOf(race.id)).length;
            toastService.addToast(
              `Filled ${getDriverDisplayName(driver)} at P${position} for ${remainingCount} remaining races`,
              'success'
            );
            trackContextMenuAction('ACTION', 'fill_rest_of_season', remainingCount);
          },
        });
      }
    } else if (!driverId && !isOfficialResult) {
      if (copiedDriverId) {
        const copiedDriver = driverById[copiedDriverId];
        if (copiedDriver) {
          items.push({
            id: 'paste',
            label: 'Paste Driver',
            icon: '📋',
            onClick: () => {
              dispatch(placeDriver({
                raceId: race.id,
                position,
                driverId: copiedDriverId,
              }));
              toastService.addToast(`Pasted ${getDriverDisplayName(copiedDriver)} at P${position}`, 'success');
              trackContextMenuAction('ACTION', 'paste_driver');
            },
          });
        }
      }

      const topDrivers = driverStandings.slice(0, 5);
      const leaderSubmenu: ContextMenuItem[] = topDrivers.map((standing, index) => {
        const standingDriver = driverById[standing.driverId];
        const icons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        return {
          id: `place-leader-${index + 1}`,
          label: `P${standing.position}: ${getDriverDisplayName(standingDriver)} (${standing.points} pts)`,
          icon: icons[index],
          onClick: () => {
            dispatch(placeDriver({
              raceId: race.id,
              position,
              driverId: standing.driverId,
            }));
            toastService.addToast(
              `Placed ${getDriverDisplayName(standingDriver)} at P${position}`,
              'success'
            );
            trackContextMenuAction('ACTION', `place_leader_${index + 1}`);
          },
        };
      });

      items.push({
        id: 'place-top5',
        label: 'Place Top 5',
        icon: '🏆',
        submenu: leaderSubmenu,
      });
    }

    if (items.length > 0) {
      items.push({
        id: 'divider-clear',
        label: '',
        divider: true,
        onClick: () => {},
      });

      items.push({
        id: 'clear-all',
        label: 'Clear All...',
        icon: '🗑️',
        submenu: [
          {
            id: 'clear-predictions',
            label: 'Clear Predictions Only',
            onClick: () => {
              dispatch(resetGrid());
              toastService.addToast('Cleared all predictions', 'info');
              trackContextMenuAction('ACTION', 'clear_predictions');
            },
          },
          {
            id: 'clear-everything',
            label: 'Clear Everything (Including Official Results)',
            onClick: () => {
              dispatch(clearEverything());
              toastService.addToast('Cleared everything', 'warning');
              trackContextMenuAction('ACTION', 'clear_everything');
            },
          },
        ],
      });
    }

    return items;
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const items = buildContextMenuItems();
    if (items.length > 0) {
      contextMenu.open(event, items);
    }
  };

  const longPressHandlers = useLongPress((event: React.TouchEvent) => {
    const items = buildContextMenuItems();
    if (items.length > 0) {
      contextMenu.open(event, items);
    }
  });

  const handleSlotClick = () => {
    if (selectedDriverId) {
      dispatch(placeDriver({
        raceId: race.id,
        position,
        driverId: selectedDriverId
      }));

      dispatch(selectDriver(null));
    }
  };

  const slotClasses = [
    'race-slot',
    race.isSprint ? 'sprint' : '',
    selectedDriverId ? 'highlight-slot' : '',
    isOfficialResult ? 'official-result-styling' : '',
    race.completed ? 'completed-race' : '',
    isHighlighted ? 'animate-slot-highlight' : '',
    isOver ? 'drag-over' : '',
    canDrop ? 'can-drop' : '',
    selectedDriverId ? 'cursor-pointer' : '',
  ].filter(Boolean).join(' ');

  const hasFastestLap = gridPosition?.hasFastestLap || false;
  const shouldShowFastestLapBorder = hasFastestLap && hasFastestLapPoint(getActiveSeason());

  return (
    <>
      <div
        className={slotClasses}
        data-testid="race-slot"
        data-race-id={race.id}
        data-position={position}
        onClick={handleSlotClick}
        onContextMenu={handleContextMenu}
        {...longPressHandlers}
        ref={drop}
        role="button"
        aria-label={driver ? `Position ${position}: ${getDriverLastName(driver.id)}` : `Empty position ${position}`}
        tabIndex={0}
        style={shouldShowFastestLapBorder ? { border: '3px solid #7D428E' } : undefined}
      >
        {driver && (
          <div className="animate-placement grid-card-wrapper">
            <DriverCard
              driver={driver}
              isOfficialResult={isOfficialResult}
              raceId={race.id}
              position={position}
              hideCode={true}
              overrideTeamId={gridPosition?.teamId}
            />
          </div>
        )}
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenu.items}
        onClose={contextMenu.close}
      />
    </>
  );
};

export default React.memo(RaceColumn);