import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getVersionHistory, deleteAllHistory, VersionSummary } from '../../api/predictions';
import { races } from '../../data/races';
import { trackVersionHistoryAction } from '../../utils/analytics';

interface VersionHistoryProps {
  onClose: () => void;
  onLoadVersion: (version: string) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ onClose, onLoadVersion }) => {
  const { fingerprint } = useSelector((state: RootState) => state.predictions);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!fingerprint) return;

    const loadHistory = async () => {
      setLoading(true);
      const history = await getVersionHistory(fingerprint, 20);
      setVersions(history);
      setLoading(false);
    };

    loadHistory();
  }, [fingerprint]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (days < 1) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };


  const getVersionTitle = (version: VersionSummary, index: number): string => {
    // First version
    if (index === versions.length - 1 && versions.length > 1) {
      return 'Initial predictions';
    }
    
    // Just show which races were edited - simple!
    if (version.races && version.races.length > 0) {
      const raceNames = version.races
        .map(raceId => {
          const race = races.find(r => r.id === raceId);
          const name = race?.name || raceId;
          // Format the name: capitalize and replace hyphens with spaces
          return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        })
        .slice(0, 2)
        .join(', ');
      
      const more = version.races.length > 2 ? ` +${version.races.length - 2} more` : '';
      return `Edited: ${raceNames}${more}`;
    }
    
    return 'No changes';
  };

  const handleLoadVersion = async (version: string) => {
    setSelectedVersion(version);
    onLoadVersion(version);
    trackVersionHistoryAction('LOAD_VERSION', version);
  };

  const handleDeleteAll = async () => {
    if (!fingerprint) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteAllHistory(fingerprint);
      
      if (success) {
        setVersions([]);
        setShowDeleteConfirm(false);
        trackVersionHistoryAction('DELETE_ALL_VERSIONS', 'success');
        onClose();
      } else {
        // Failed to delete history
      }
    } catch (error) {
      // Error deleting history
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Prediction History</h2>
            <div className="flex items-center gap-2">
              {versions.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                  aria-label="Delete all history"
                >
                  Delete All
                </button>
              )}
              <button
                onClick={() => {
                  trackVersionHistoryAction('CLOSE_HISTORY');
                  onClose();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p>No prediction history found.</p>
              <p className="text-sm mt-2">Start making predictions to see your history here!</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {versions.map((version, index) => {
                  const isLatest = index === 0;
                  const isSelected = selectedVersion === version.version;
                  
                  return (
                    <div
                      key={version.version}
                      className={`relative pl-8 ${index !== versions.length - 1 ? 'pb-4' : ''}`}
                    >
                      {/* Timeline line */}
                      {index !== versions.length - 1 && (
                        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-300"></div>
                      )}
                      
                      {/* Timeline dot */}
                      <div className={`absolute left-1.5 top-2 w-3 h-3 rounded-full ${
                        isLatest ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      
                      {/* Version card */}
                      <div className={`border rounded-lg p-4 transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">
                                {getVersionTitle(version, index)}
                              </span>
                              {isLatest && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(version.timestamp)}
                              </span>
                            </div>
                            
                          </div>
                          
                          {!isLatest && (
                            <button
                              onClick={() => handleLoadVersion(version.version)}
                              className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Load
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p>💡 Tip: Your predictions are automatically saved every time you make changes.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Delete All History?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete all your prediction history. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;