import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { selectDriverStandings, selectTeamStandings } from '../../store/selectors/resultsSelectors';
import { setActiveTab } from '../../store/slices/uiSlice';
import DriverStandingsTable from './DriverStandingsTable';
import TeamStandingsTable from './TeamStandingsTable';
import TableSkeleton from '../common/TableSkeleton';
import { DriverPointsChart, TeamPointsChart } from '../charts/LazyCharts';
import { useAppDispatch } from '../../store';
import { trackStandingsTabChange } from '../../utils/analytics';

const StandingsSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const driverStandings = useSelector(selectDriverStandings);
  const teamStandings = useSelector(selectTeamStandings);
  const uiActiveTab = useSelector((state: RootState) => state.ui.activeTab);
  
  // Local state to track the active tab
  const [activeTab, setActiveTabState] = useState<'tables' | 'charts'>(uiActiveTab);
  
  // Handle tab change
  const handleTabChange = (tab: 'tables' | 'charts') => {
    setActiveTabState(tab);
    dispatch(setActiveTab(tab));
    trackStandingsTabChange(tab);
  };

  // Use the tab from Redux when it changes
  useEffect(() => {
    setActiveTabState(uiActiveTab);
  }, [uiActiveTab]);

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gray-50 pb-4">
      {/* Mobile title - only visible on mobile */}
      <div className="sm:hidden py-4 bg-red-600 text-white border-b border-red-700">
        <h2 className="text-xl font-bold text-center">Championship Standings</h2>
      </div>
      
      {/* Top decorative stripe */}
      <div className="hidden sm:block h-2 w-full bg-red-600"></div>
      
      {/* Standings header */}
      <div className="hidden sm:flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-800">Championship Standings</h2>
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2">Updated</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Live</span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex mx-4 mt-4 bg-white rounded-lg p-1 sticky top-0 z-10 shadow-sm border border-gray-200">
        <button
          className={`flex-1 px-4 py-2 font-medium text-sm rounded-md transition-all 
            ${activeTab === 'tables' 
              ? 'bg-red-600 text-white shadow-sm' 
              : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => handleTabChange('tables')}
        >
          TABLES
        </button>
        <button
          className={`flex-1 px-4 py-2 font-medium text-sm rounded-md transition-all 
            ${activeTab === 'charts' 
              ? 'bg-red-600 text-white shadow-sm' 
              : 'text-gray-700 hover:bg-gray-100'}`}
          onClick={() => handleTabChange('charts')}
        >
          CHARTS
        </button>
      </div>

      {/* Tab content */}
      <div className="overflow-auto flex-1 px-4 pt-4">
        {activeTab === 'tables' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h2 className="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Driver Standings
              </h2>
              <div className="overflow-x-auto">
                {driverStandings.length === 0 ? (
                  <TableSkeleton rows={20} type="driver" />
                ) : (
                  <DriverStandingsTable standings={driverStandings} />
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h2 className="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Constructor Standings
              </h2>
              <div className="overflow-x-auto">
                {teamStandings.length === 0 ? (
                  <TableSkeleton rows={10} type="team" />
                ) : (
                  <TeamStandingsTable standings={teamStandings} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h3 className="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Driver Championship
              </h3>
              <div className="p-3">
                <Suspense fallback={
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                }>
                  <DriverPointsChart />
                </Suspense>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h3 className="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span className="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Constructor Championship
              </h3>
              <div className="p-3">
                <Suspense fallback={
                  <div className="h-[250px] flex items-center justify-center">
                    <div className="text-gray-500">Loading chart...</div>
                  </div>
                }>
                  <TeamPointsChart />
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandingsSidebar;