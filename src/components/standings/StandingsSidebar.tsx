import React, { useState, useEffect, Suspense, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { selectDriverStandings, selectTeamStandings } from '../../store/selectors/resultsSelectors';
import { setActiveTab } from '../../store/slices/uiSlice';
import DriverStandingsTable from './DriverStandingsTable';
import TeamStandingsTable from './TeamStandingsTable';
import TableSkeleton from '../common/TableSkeleton';
import { DriverPointsChart, TeamPointsChart } from '../charts/LazyCharts';
import { useAppDispatch } from '../../store';
import CompetitionCard from './CompetitionCard';
import SegmentedControl from '../ui/SegmentedControl';
import ChartSettingsButton from './ChartSettingsButton';
import TableSettingsButton from './TableSettingsButton';

// Sticky section heading with its own settings gear on the right. The gear is
// scoped to what sits directly below it (a table in the Tables tab, a chart in
// the Charts tab), so there's no panel-wide "settings" button.
const SectionHeading: React.FC<{ title: string; gear: ReactNode; stackLevel: number; className?: string }> = ({
  title,
  gear,
  stackLevel,
  className = ''
}) => (
  // `position: sticky` always creates a stacking context, so an open settings
  // popover is confined to its heading's context. A popover only ever overlaps
  // the section *below* it, so we give earlier headings a higher stack level —
  // the Drivers popover then paints above the Constructors heading, while the
  // (last) Constructors popover opens over non-positioned cards and is fine.
  <div
    style={{ zIndex: stackLevel }}
    className={`sticky top-0 bg-surface px-3 pb-1 flex items-center justify-between gap-2 ${className}`}
  >
    <h3 className="text-2xs font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
    {gear}
  </div>
);

const StandingsSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const driverStandings = useSelector(selectDriverStandings);
  const teamStandings = useSelector(selectTeamStandings);
  const isLoading = useSelector((state: RootState) => state.seasonData.isLoading);
  const uiActiveTab = useSelector((state: RootState) => state.ui.activeTab);

  const [activeTab, setActiveTabState] = useState<'tables' | 'charts'>(uiActiveTab);

  const handleTabChange = (tab: 'tables' | 'charts') => {
    setActiveTabState(tab);
    dispatch(setActiveTab(tab));
  };

  useEffect(() => {
    setActiveTabState(uiActiveTab);
  }, [uiActiveTab]);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-surface pb-3">
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold font-display text-ink truncate">
          <span className="hidden lg:inline">Championship </span>Standings
        </h2>
        <SegmentedControl
          className="shrink-0"
          aria-label="Standings view"
          options={[
            { value: 'tables', label: 'Tables' },
            { value: 'charts', label: 'Charts' },
          ]}
          value={activeTab}
          onChange={handleTabChange}
        />
      </div>

      <div className="overflow-auto flex-1">
        {activeTab === 'tables' ? (
          <>
            <SectionHeading
              title="Drivers"
              stackLevel={12}
              className="pt-2"
              gear={<TableSettingsButton section="drivers" />}
            />
            <div className="overflow-x-auto px-1">
              {isLoading || driverStandings.length === 0 ? (
                <TableSkeleton rows={20} type="driver" />
              ) : (
                <DriverStandingsTable standings={driverStandings} />
              )}
            </div>

            <SectionHeading
              title="Constructors"
              stackLevel={11}
              className="pt-3 mt-1 border-t"
              gear={<TableSettingsButton section="teams" />}
            />
            <div className="overflow-x-auto px-1">
              {isLoading || teamStandings.length === 0 ? (
                <TableSkeleton rows={10} type="team" />
              ) : (
                <TeamStandingsTable standings={teamStandings} />
              )}
            </div>

            <div className="px-3 pt-3">
              <CompetitionCard />
            </div>
          </>
        ) : (
          <>
            <SectionHeading
              title="Drivers"
              stackLevel={12}
              className="pt-2"
              gear={<ChartSettingsButton section="drivers" />}
            />
            <div className="px-2">
              <Suspense fallback={
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-ink-muted">Loading chart...</div>
                </div>
              }>
                <DriverPointsChart />
              </Suspense>
            </div>

            <SectionHeading
              title="Constructors"
              stackLevel={11}
              className="pt-3 mt-2 border-t"
              gear={<ChartSettingsButton section="teams" />}
            />
            <div className="px-2">
              <Suspense fallback={
                <div className="h-[250px] flex items-center justify-center">
                  <div className="text-ink-muted">Loading chart...</div>
                </div>
              }>
                <TeamPointsChart />
              </Suspense>
            </div>

            <div className="px-3 pt-3">
              <CompetitionCard />
            </div>
          </>
        )}

        <div className="mx-3 mt-3 pt-3 border-t text-xs text-ink-muted flex flex-wrap gap-x-3 gap-y-1">
          <a href="https://chyuang.com" className="hover:text-ink" target="_blank" rel="noopener noreferrer">By Chyuang</a>
          <a href="https://github.com/yuyangchee98/F1-Points-Calculator" className="hover:text-ink" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:f1pointscalculator@chyuang.com" className="hover:text-ink">Contact</a>
          <a href="/changelog" className="hover:text-ink">Changelog</a>
          <a href="https://f1-dash.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">F1 Dash</a>
          <a href="https://f1calendar.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">F1 Calendar</a>
          <a href="https://drawlineracing.chyuang.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">Draw Line Racing</a>
        </div>
      </div>
    </div>
  );
};

export default StandingsSidebar;
