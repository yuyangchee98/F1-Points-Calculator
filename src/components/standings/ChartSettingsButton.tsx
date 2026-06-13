import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useAppDispatch } from '../../store';
import type { ChartMetric, StandingsSection } from '../../types';
import { setChartSelection, setChartMetric } from '../../store/slices/uiSlice';
import {
  selectDriverStandings,
  selectTeamStandings
} from '../../store/selectors/resultsSelectors';
import {
  selectDriversByIdMap,
  selectTeamsByIdMap,
  getDriverLastName
} from '../../store/selectors/dataSelectors';
import { resolveChartSelection } from '../charts/chartHelpers';
import SegmentedControl from '../ui/SegmentedControl';
import SettingsPopover from './SettingsPopover';

const METRIC_OPTIONS: { value: ChartMetric; label: string }[] = [
  { value: 'cumulative', label: 'Cumulative' },
  { value: 'gap', label: 'Gap to leader' }
];

interface Entity {
  id: string;
  label: string;
  color: string;
}

// All entities for a section, ordered by standings, with the colour that
// matches their chart line.
const useSectionEntities = (section: StandingsSection): Entity[] => {
  const driverStandings = useSelector(selectDriverStandings);
  const teamStandings = useSelector(selectTeamStandings);
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  return useMemo(() => {
    if (section === 'drivers') {
      return driverStandings
        .map(s => {
          const driver = driverById[s.driverId];
          if (!driver) return null;
          return {
            id: s.driverId,
            label: getDriverLastName(driver.id),
            color: teamById[driver.team]?.color || '#ccc'
          };
        })
        .filter(Boolean) as Entity[];
    }
    return teamStandings
      .map(s => {
        const team = teamById[s.teamId];
        if (!team) return null;
        return { id: s.teamId, label: team.name, color: team.color };
      })
      .filter(Boolean) as Entity[];
  }, [section, driverStandings, teamStandings, driverById, teamById]);
};

interface ChartSettingsButtonProps {
  section: StandingsSection;
}

const ChartSettingsButton: React.FC<ChartSettingsButtonProps> = ({ section }) => {
  const dispatch = useAppDispatch();
  const entities = useSectionEntities(section);
  const selection = useSelector((state: RootState) =>
    section === 'drivers' ? state.ui.driverChartSelection : state.ui.teamChartSelection
  );
  const metric = useSelector((state: RootState) =>
    section === 'drivers' ? state.ui.driverChartMetric : state.ui.teamChartMetric
  );

  const orderedIds = entities.map(e => e.id);
  // The set actually shown (selection, or the default top 5). The checklist
  // reflects this, so the first toggle "materialises" the default into an
  // explicit selection.
  const shown = resolveChartSelection(selection, orderedIds);
  const shownSet = new Set(shown);

  const toggle = (id: string) => {
    const next = shownSet.has(id) ? shown.filter(x => x !== id) : [...shown, id];
    dispatch(setChartSelection({ section, ids: next }));
  };

  const applyPreset = (count: number) => {
    dispatch(setChartSelection({ section, ids: orderedIds.slice(0, count) }));
  };

  const label = section === 'drivers' ? 'Driver chart settings' : 'Constructor chart settings';
  const entityNoun = section === 'drivers' ? 'drivers' : 'teams';

  return (
    <SettingsPopover ariaLabel={label} widthRem={16}>
      <label className="block text-xs text-ink-secondary mb-1">Metric</label>
      <SegmentedControl<ChartMetric>
        className="mb-3"
        aria-label="Chart metric"
        options={METRIC_OPTIONS}
        value={metric}
        onChange={(v) => dispatch(setChartMetric({ section, value: v }))}
      />

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-ink-secondary">
          Lines shown <span className="text-ink-muted">({shown.length})</span>
        </span>
        <span className="flex gap-1">
          <button
            type="button"
            onClick={() => applyPreset(5)}
            className="text-2xs px-2 py-0.5 rounded border border-strong text-ink-secondary hover:bg-carbon-50 hover:text-ink"
          >
            Top 5
          </button>
          <button
            type="button"
            onClick={() => applyPreset(10)}
            className="text-2xs px-2 py-0.5 rounded border border-strong text-ink-secondary hover:bg-carbon-50 hover:text-ink"
          >
            Top 10
          </button>
        </span>
      </div>

      <div className="-mx-1 max-h-[min(50vh,18rem)] overflow-y-auto" role="group" aria-label={`Choose ${entityNoun} to chart`}>
        {entities.map(entity => {
          const checked = shownSet.has(entity.id);
          return (
            <button
              key={entity.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => toggle(entity.id)}
              className="w-full flex items-center gap-2 px-1 py-1.5 rounded hover:bg-carbon-50 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entity.color }} />
              <span className="flex-1 text-sm text-ink truncate">{entity.label}</span>
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  checked ? 'bg-carbon-800 border-carbon-800 text-white' : 'border-strong text-transparent'
                }`}
              >
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </SettingsPopover>
  );
};

export default ChartSettingsButton;
