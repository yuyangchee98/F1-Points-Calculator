import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const SaveStatus: React.FC = () => {
  const { saveStatus, lastSaveTimestamp } = useSelector((state: RootState) => state.predictions);

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center gap-1 text-gray-500 text-xs">
            <span className="animate-spin">🔄</span> Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-green-600 text-xs">
            ✓ Saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center gap-1 text-red-600 text-xs">
            ⚠️ Save failed
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-10">
      <div className={`transition-opacity duration-300 ${saveStatus !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-white shadow-md rounded-lg px-3 py-2 flex items-center gap-2">
          {getStatusDisplay()}
          {saveStatus === 'saved' && lastSaveTimestamp && (
            <span className="text-gray-400 text-xs">
              {formatTimestamp(lastSaveTimestamp)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveStatus;