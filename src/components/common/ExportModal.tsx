import React, { useState, useMemo } from 'react';
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

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('F1 CHAMPIONSHIP PREDICTIONS');
  const [subtitle, setSubtitle] = useState('Current predictions and standings');

  const state = useSelector((state: RootState) => state);
  const { races } = state.seasonData;
  const { positions } = state.grid;

  // Initialize race selection with smart defaults
  // Select: last completed race + races with user predictions
  const [raceSelection, setRaceSelection] = useState<RaceSelection>(() => {
    const initial: RaceSelection = {};

    // Find the last completed race (races array is already sorted chronologically)
    const completedRaces = races.filter(r => r.completed);
    const lastCompletedRace = completedRaces[completedRaces.length - 1];

    races.forEach(race => {
      // Include if: (1) it's the last completed race OR (2) has user predictions
      const hasUserPredictions = positions.some(
        p => p.raceId === race.id && p.driverId && !p.isOfficialResult
      );
      const isLastCompletedRace = lastCompletedRace && race.id === lastCompletedRace.id;
      initial[race.id] = isLastCompletedRace || hasUserPredictions;
    });
    return initial;
  });

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format the data with race filtering
      const exportData = formatExportData(
        state,
        title,
        subtitle,
        raceSelection
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

  const selectedRaceCount = Object.values(raceSelection).filter(Boolean).length;

  // Generate preview data
  const previewData = useMemo(() => {
    return formatExportData(state, title, subtitle, raceSelection);
  }, [state, title, subtitle, raceSelection]);

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
          <div className="w-80 border-r p-6 overflow-y-auto">
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

              {/* Race Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Races ({selectedRaceCount} selected)
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {races.map(race => {
                    const hasUserPredictions = positions.some(
                      p => p.raceId === race.id && p.driverId && !p.isOfficialResult
                    );
                    return (
                      <label
                        key={race.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={raceSelection[race.id] || false}
                          onChange={() => toggleRace(race.id)}
                          className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-sm flex-1">
                          {race.name}
                          {race.completed && (
                            <span className="ml-2 text-xs text-green-600">✓ Completed</span>
                          )}
                          {hasUserPredictions && (
                            <span className="ml-2 text-xs text-blue-600">★ Predicted</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 bg-gray-50 overflow-auto">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
              <p className="text-sm text-gray-500">
                {selectedRaceCount} race{selectedRaceCount !== 1 ? 's' : ''} selected
              </p>
            </div>
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
