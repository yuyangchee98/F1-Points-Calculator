import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Race } from '../../types';
import { RootState } from '../../store';
import { selectDriverAtPosition, selectDriversByIdMap, getDriverLastName, getDriverDisplayName } from '../../store/selectors/dataSelectors';
import DriverCard from '../drivers/DriverCard';
import { selectDriver, copyDriver } from '../../store/slices/uiSlice';
import { placeDriver, clearPosition, fillRestOfSeason, resetGrid, clearEverything } from '../../store/slices/gridSlice';
import { calculateResults } from '../../store/slices/resultsSlice';
import { useAppDispatch } from '../../store';
import { useDriverDrop } from '../../hooks/useDriverDragDrop';
import { useContextMenu, useLongPress } from '../../hooks/useContextMenu';
import ContextMenu from '../common/ContextMenu';
import { ContextMenuItem } from '../../types/contextMenu';
import { toastService } from '../common/ToastContainer';
import { trackContextMenuAction } from '../../utils/analytics';

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
  const driverStandings = useSelector((state: RootState) => state.results.driverStandings);
  const races = useSelector((state: RootState) => state.seasonData.races);

  // Animation states
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevDriverId, setPrevDriverId] = useState<string | null>(null);

  // Context menu hook
  const contextMenu = useContextMenu();

  // Set up the drop target
  const { drop, isOver, canDrop } = useDriverDrop({
    raceId: race.id,
    position,
  });

  // Detect when a driver is placed and trigger animation
  useEffect(() => {
    if (driverId && driverId !== prevDriverId) {
      setIsHighlighted(true);
      const timer = setTimeout(() => setIsHighlighted(false), 800);
      return () => clearTimeout(timer);
    }
    setPrevDriverId(driverId);
  }, [driverId, prevDriverId]);

  // Find the grid position object to determine if it's an official result
  const gridPosition = positions.find(p =>
    p.raceId === race.id && p.position === position
  );
  const isOfficialResult = gridPosition?.isOfficialResult || false;

  // Get the driver object if there's a driver in this position
  const driver = driverId ? driverById[driverId] : null;

  // Build context menu items based on slot state
  const buildContextMenuItems = (): ContextMenuItem[] => {
    const items: ContextMenuItem[] = [];

    if (driverId && driver) {
      // Menu when slot has a driver (official or not)

      // Copy is always available
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

      // Remove and Fill are only for non-official results
      if (!isOfficialResult) {
        items.push({
          id: 'remove',
          label: 'Remove Driver',
          icon: '✕',
          onClick: () => {
            dispatch(clearPosition({ raceId: race.id, position }));
            dispatch(calculateResults());
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
            dispatch(calculateResults());

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
      // Menu when slot is empty

      // Paste Driver if there's a copied driver
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
              dispatch(calculateResults());
              toastService.addToast(`Pasted ${getDriverDisplayName(copiedDriver)} at P${position}`, 'success');
              trackContextMenuAction('ACTION', 'paste_driver');
            },
          });
        }
      }

      // Place Championship Leaders submenu (Top 5)
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
            dispatch(calculateResults());
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

    // Add divider and "Clear All..." submenu at the bottom of every context menu
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
              dispatch(calculateResults());
              toastService.addToast('Cleared all predictions', 'info');
              trackContextMenuAction('ACTION', 'clear_predictions');
            },
          },
          {
            id: 'clear-everything',
            label: 'Clear Everything (Including Official Results)',
            onClick: () => {
              dispatch(clearEverything());
              dispatch(calculateResults());
              toastService.addToast('Cleared everything', 'warning');
              trackContextMenuAction('ACTION', 'clear_everything');
            },
          },
        ],
      });
    }

    return items;
  };

  // Handle right-click to open context menu
  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const items = buildContextMenuItems();
    if (items.length > 0) {
      contextMenu.open(event, items);
    }
  };

  // Handle long press for mobile
  const longPressHandlers = useLongPress((event: React.TouchEvent) => {
    const items = buildContextMenuItems();
    if (items.length > 0) {
      contextMenu.open(event, items);
    }
  });

  // Handle click on the race slot to place the selected driver
  const handleSlotClick = () => {
    // If we have a driver selected and this is a valid slot
    if (selectedDriverId) {
      dispatch(placeDriver({
        raceId: race.id,
        position,
        driverId: selectedDriverId
      }));
      
      // Update point calculations
      dispatch(calculateResults());
      
      // Clear the selected driver
      dispatch(selectDriver(null));
    }
  };

  // Prepare classes for the race slot
  const slotClasses = [
    'race-slot',
    race.isSprint ? 'sprint' : '',
    // Highlight slots when a driver is selected
    selectedDriverId ? 'highlight-slot' : '',
    // Keep the official-result class for styling only
    isOfficialResult ? 'official-result-styling' : '',
    // Add a class for completed races
    race.completed ? 'completed-race' : '',
    // Animation classes
    isHighlighted ? 'animate-slot-highlight' : '',
    // React DnD classes
    isOver ? 'drag-over' : '',
    canDrop ? 'can-drop' : '',
    selectedDriverId ? 'cursor-pointer' : '',
  ].filter(Boolean).join(' ');

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

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={contextMenu.items}
        onClose={contextMenu.close}
      />
    </>
  );
};

export default RaceColumn;