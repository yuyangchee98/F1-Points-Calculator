import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { exportPrediction } from '../../api/export';
import { formatExportData } from '../../utils/exportFormatter';
import ExportPreview from './ExportPreview';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RaceSelection {
  [raceId: string]: boolean;
}

// Convert country code to flag emoji
function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏁';

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));

  return String.fromCodePoint(...codePoints);
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('F1 CHAMPIONSHIP PREDICTIONS');
  const [subtitle, setSubtitle] = useState('Current predictions and standings');
  const [selectedDrivers, setSelectedDrivers] = useState<Record<string, boolean>>({});
  const [driverFilter, setDriverFilter] = useState<'all' | 'top3' | 'top5' | 'top10' | 'withPredictions' | 'positionChanged'>('all');
  const [completedDropdownOpen, setCompletedDropdownOpen] = useState(false);
  const [upcomingDropdownOpen, setUpcomingDropdownOpen] = useState(false);
  const [driverDropdownOpen, setDriverDropdownOpen] = useState(false);

  const races = useSelector((state: RootState) => state.seasonData.races);
  const positions = useSelector((state: RootState) => state.grid.positions);
  const seasonData = useSelector((state: RootState) => state.seasonData);
  const grid = useSelector((state: RootState) => state.grid);
  const results = useSelector((state: RootState) => state.results);

  // Initialize race selection with smart defaults
  // Select: last completed race + races with user predictions
  const [raceSelection, setRaceSelection] = useState<RaceSelection>({});

  // Update race selection when races or positions change
  useEffect(() => {
    if (races.length === 0) return; // Wait for races to load

    console.log('[ExportModal] Updating race selection');
    console.log('[ExportModal] Total races:', races.length);

    const initial: RaceSelection = {};

    // Find the last completed race (races array is already sorted chronologically)
    const completedRaces = races.filter(r => r.completed);
    console.log('[ExportModal] Completed races:', completedRaces.map(r => ({ id: r.id, name: r.name, order: r.order })));

    const lastCompletedRace = completedRaces[completedRaces.length - 1];
    console.log('[ExportModal] Last completed race:', lastCompletedRace ? { id: lastCompletedRace.id, name: lastCompletedRace.name } : 'none');

    races.forEach(race => {
      // Include if: (1) it's the last completed race OR (2) has user predictions
      const hasUserPredictions = positions.some(
        p => p.raceId === race.id && p.driverId && !p.isOfficialResult
      );
      const isLastCompletedRace = lastCompletedRace && race.id === lastCompletedRace.id;

      if (hasUserPredictions) {
        console.log(`[ExportModal] Race "${race.name}" has user predictions`);
      }
      if (isLastCompletedRace) {
        console.log(`[ExportModal] Race "${race.name}" is last completed race`);
      }

      initial[race.id] = isLastCompletedRace || hasUserPredictions;
    });

    console.log('[ExportModal] Final initial selection:', initial);
    console.log('[ExportModal] Selected race count:', Object.values(initial).filter(Boolean).length);

    setRaceSelection(initial);
  }, [races, positions]);

  // Initialize driver selection with top 3 drivers
  useEffect(() => {
    if (results.driverStandings.length === 0) return;

    const initial: Record<string, boolean> = {};
    // Select top 3 drivers by default
    results.driverStandings.slice(0, 3).forEach(standing => {
      initial[standing.driverId] = true;
    });

    setSelectedDrivers(initial);
  }, [results.driverStandings]);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format the data with race and driver filtering
      const exportData = formatExportData(
        { seasonData, grid, results } as RootState,
        title,
        subtitle,
        raceSelection,
        selectedDrivers
      );

      // Call export API
      const blob = await exportPrediction(exportData);

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `f1-predictions-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Close modal
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to generate export image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRace = (raceId: string) => {
    setRaceSelection(prev => ({
      ...prev,
      [raceId]: !prev[raceId]
    }));
  };

  const toggleDriver = (driverId: string) => {
    setSelectedDrivers(prev => ({
      ...prev,
      [driverId]: !prev[driverId]
    }));
  };

  // Separate completed and upcoming races
  const completedRaces = useMemo(() => races.filter(r => r.completed), [races]);
  const upcomingRaces = useMemo(() => races.filter(r => !r.completed), [races]);

  // Filter drivers based on selected filter
  const filteredDrivers = useMemo(() => {
    if (driverFilter === 'all') return results.driverStandings;
    if (driverFilter === 'top3') return results.driverStandings.slice(0, 3);
    if (driverFilter === 'top5') return results.driverStandings.slice(0, 5);
    if (driverFilter === 'top10') return results.driverStandings.slice(0, 10);
    if (driverFilter === 'withPredictions') {
      return results.driverStandings.filter(s => s.predictionPointsGained > 0);
    }
    if (driverFilter === 'positionChanged') {
      return results.driverStandings.filter(s => s.positionChange !== 0);
    }
    return results.driverStandings;
  }, [results.driverStandings, driverFilter]);

  // Calculate selected counts with limits (use all races, not filtered)
  const selectedCompletedRaces = races
    .filter(r => r.completed && raceSelection[r.id])
    .length;
  const selectedUpcomingRaces = races
    .filter(r => !r.completed && raceSelection[r.id])
    .length;
  const selectedRaceCount = selectedCompletedRaces + selectedUpcomingRaces;
  const selectedDriverCount = Object.values(selectedDrivers).filter(Boolean).length;

  // Race limits
  const MAX_COMPLETED_RACES = 1;
  const MAX_UPCOMING_RACES = 4;
  const isCompletedLimitReached = selectedCompletedRaces >= MAX_COMPLETED_RACES;
  const isUpcomingLimitReached = selectedUpcomingRaces >= MAX_UPCOMING_RACES;

  // Driver limit
  const MAX_DRIVERS = 3;
  const isDriverLimitReached = selectedDriverCount >= MAX_DRIVERS;

  // Generate preview data
  const previewData = useMemo(() => {
    return formatExportData(
      { seasonData, grid, results } as RootState,
      title,
      subtitle,
      raceSelection,
      selectedDrivers
    );
  }, [seasonData, grid, results, title, subtitle, raceSelection, selectedDrivers]);

  // Early return after all hooks have been called
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Export to Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content: Settings + Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Panel */}
          <div className="w-96 border-r p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., MY F1 PREDICTIONS"
                />
              </div>

              {/* Subtitle Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., If Verstappen wins..."
                />
              </div>

              {/* Completed Race Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Completed Race
                </label>

                {/* Dropdown Trigger */}
                <button
                  onClick={() => setCompletedDropdownOpen(!completedDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedCompletedRaces === 0 ? 'No race selected' : `${selectedCompletedRaces} race selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${completedDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                {completedDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-red-500">
                    <div className="space-y-1.5">
                      {completedRaces.map(race => {
                        const hasUserPredictions = positions.some(
                          p => p.raceId === race.id && p.driverId && !p.isOfficialResult
                        );
                        const isSelected = raceSelection[race.id] || false;
                        const isDisabled = !isSelected && isCompletedLimitReached;

                        return (
                          <div
                            key={race.id}
                            onClick={() => !isDisabled && toggleRace(race.id)}
                            className={`
                              relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                              ${isDisabled
                                ? 'opacity-50 cursor-not-allowed border-2 border-gray-200 bg-gray-50'
                                : isSelected
                                  ? 'border-2 border-red-500 bg-red-50/30 shadow-md cursor-pointer'
                                  : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => {}}
                              className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                            <span className="text-2xl">{countryCodeToFlag(race.countryCode)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {race.name}
                              </div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  ✓ Completed
                                </span>
                                {hasUserPredictions && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    ★ Predicted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Done Button */}
                    <div className="mt-4 pt-3 border-t">
                      <button
                        onClick={() => setCompletedDropdownOpen(false)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Races Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Upcoming Races
                </label>

                {/* Dropdown Trigger */}
                <button
                  onClick={() => setUpcomingDropdownOpen(!upcomingDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedUpcomingRaces === 0 ? 'No races selected' : `${selectedUpcomingRaces}/${MAX_UPCOMING_RACES} races selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${upcomingDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                {upcomingDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-red-500">
                    <div className="space-y-1.5">
                      {upcomingRaces.map(race => {
                        const hasUserPredictions = positions.some(
                          p => p.raceId === race.id && p.driverId && !p.isOfficialResult
                        );
                        const isSelected = raceSelection[race.id] || false;
                        const isDisabled = !isSelected && isUpcomingLimitReached;

                        return (
                          <div
                            key={race.id}
                            onClick={() => !isDisabled && toggleRace(race.id)}
                            className={`
                              relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                              ${isDisabled
                                ? 'opacity-50 cursor-not-allowed border-2 border-gray-200 bg-gray-50'
                                : isSelected
                                  ? 'border-2 border-red-500 bg-red-50/30 shadow-md cursor-pointer'
                                  : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isDisabled}
                              onChange={() => {}}
                              className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            />
                            <span className="text-2xl">{countryCodeToFlag(race.countryCode)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {race.name}
                              </div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {hasUserPredictions && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                    ★ Predicted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Done Button */}
                    <div className="mt-4 pt-3 border-t">
                      <button
                        onClick={() => setUpcomingDropdownOpen(false)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Driver Selection */}
              <div className="relative">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-sm font-semibold text-gray-900">
                    Championship Standings
                  </label>

                  {/* Filter Dropdown */}
                  <select
                    value={driverFilter}
                    onChange={(e) => setDriverFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white hover:text-gray-700 transition-colors"
                  >
                    <option value="all">Filter: All</option>
                    <option value="top3">Filter: Top 3</option>
                    <option value="top5">Filter: Top 5</option>
                    <option value="top10">Filter: Top 10</option>
                    <option value="withPredictions">Filter: With Predictions</option>
                    <option value="positionChanged">Filter: Position Changed</option>
                  </select>
                </div>

                {/* Dropdown Trigger */}
                <button
                  onClick={() => setDriverDropdownOpen(!driverDropdownOpen)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors text-left flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedDriverCount === 0 ? 'No drivers selected' : `${selectedDriverCount}/${MAX_DRIVERS} drivers selected`}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${driverDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Panel */}
                {driverDropdownOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-red-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-red-500">
                    <div className="space-y-1.5">
                  {filteredDrivers.map(standing => {
                    const driver = seasonData.drivers.find(d => d.id === standing.driverId);
                    if (!driver) return null;

                    const team = seasonData.teams.find(t => t.id === driver.team);
                    const teamColor = team?.color || '#ccc';
                    const isSelected = selectedDrivers[standing.driverId] || false;
                    const isDisabled = !isSelected && isDriverLimitReached;

                    return (
                      <div
                        key={standing.driverId}
                        onClick={() => !isDisabled && toggleDriver(standing.driverId)}
                        className={`
                          relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200
                          ${isDisabled
                            ? 'opacity-50 cursor-not-allowed border-2 border-gray-200 bg-gray-50'
                            : isSelected
                              ? 'border-2 border-red-500 bg-red-50/30 shadow-md cursor-pointer'
                              : 'border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={() => {}}
                          className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        />
                        <div
                          className="w-1 h-12 rounded-full"
                          style={{ backgroundColor: teamColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm">
                                {standing.position}. {driver.familyName.toUpperCase()}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {team?.name || 'Unknown Team'}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-bold text-gray-900 text-sm">
                                {standing.points} pts
                              </div>
                              {standing.positionChange !== 0 && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                                    standing.positionChange > 0
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {standing.positionChange > 0 ? '↑' : '↓'} {Math.abs(standing.positionChange)}
                                </span>
                              )}
                              {standing.predictionPointsGained > 0 && standing.positionChange === 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mt-1">
                                  +{standing.predictionPointsGained}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                    </div>

                    {/* Done Button */}
                    <div className="mt-4 pt-3 border-t">
                      <button
                        onClick={() => setDriverDropdownOpen(false)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 bg-gray-50 overflow-auto">
            {selectedRaceCount > 0 ? (
              <ExportPreview data={previewData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Select at least one race to see preview</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isLoading || selectedRaceCount === 0}
              className={`flex-1 px-4 py-2 rounded-md transition font-semibold ${
                isLoading || selectedRaceCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
          {isLoading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                This may take 15-20 seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
