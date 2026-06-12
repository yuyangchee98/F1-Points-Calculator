import React, { useState, useEffect, Suspense } from 'react';
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
import Card from '../ui/Card';

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
    <div className="h-full overflow-hidden flex flex-col bg-surface-sunken pb-4">
      <div className="px-4 py-3 border-b bg-surface">
        <h2 className="text-xl font-semibold font-display text-ink text-center sm:text-left">
          Championship Standings
          <span className="block h-0.5 w-10 bg-brand mt-1 mx-auto sm:mx-0" aria-hidden="true"></span>
        </h2>
      </div>

      <SegmentedControl
        className="mx-4 mt-4 sticky top-0 z-sticky"
        aria-label="Standings view"
        options={[
          { value: 'tables', label: 'Tables' },
          { value: 'charts', label: 'Charts' },
        ]}
        value={activeTab}
        onChange={handleTabChange}
      />

      <div className="overflow-auto flex-1 px-4 pt-4">
        {activeTab === 'tables' ? (
          <div className="space-y-6">
            <Card title="Driver Standings">
              <div className="overflow-x-auto">
                {isLoading || driverStandings.length === 0 ? (
                  <TableSkeleton rows={20} type="driver" />
                ) : (
                  <DriverStandingsTable standings={driverStandings} />
                )}
              </div>
            </Card>

            <Card title="Constructor Standings">
              <div className="overflow-x-auto">
                {isLoading || teamStandings.length === 0 ? (
                  <TableSkeleton rows={10} type="team" />
                ) : (
                  <TeamStandingsTable standings={teamStandings} />
                )}
              </div>
            </Card>

            <CompetitionCard />
          </div>
        ) : (
          <div className="space-y-6">
            <Card title="Driver Championship">
              <div className="p-3">
                <Suspense fallback={
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-ink-muted">Loading chart...</div>
                  </div>
                }>
                  <DriverPointsChart />
                </Suspense>
              </div>
            </Card>

            <Card title="Constructor Championship">
              <div className="p-3">
                <Suspense fallback={
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-ink-muted">Loading chart...</div>
                  </div>
                }>
                  <TeamPointsChart />
                </Suspense>
              </div>
            </Card>

            <CompetitionCard />
          </div>
        )}

        <div className="mt-6 pt-4 border-t text-xs text-ink-muted space-y-1.5">
          <p>Created by <a href="https://chyuang.com" className="hover:text-ink" target="_blank" rel="noopener noreferrer">Chyuang</a></p>
          <p><a href="https://github.com/yuyangchee98/F1-Points-Calculator" className="hover:text-ink" target="_blank" rel="noopener noreferrer">Open source on GitHub</a></p>
          <p><a href="mailto:f1pointscalculator@chyuang.com" className="hover:text-ink">Contact</a></p>
          <p><a href="/changelog" className="hover:text-ink">Changelog</a></p>
          <div className="flex gap-3 pt-1">
            <a href="https://f1-dash.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">F1 Dash</a>
            <a href="https://f1calendar.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">F1 Calendar</a>
            <a href="https://drawlineracing.chyuang.com/" className="hover:text-ink" target="_blank" rel="noopener noreferrer">Draw Line Racing</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandingsSidebar;