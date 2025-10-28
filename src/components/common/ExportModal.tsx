import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { exportPrediction } from '../../api/export';
import { formatExportData } from '../../utils/exportFormatter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const state = useSelector((state: RootState) => state);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format the data
      const exportData = formatExportData(
        state,
        'F1 CHAMPIONSHIP PREDICTIONS',
        'Current predictions and standings'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Export to Image</h2>

          <div className="mb-6">
            <p className="text-gray-600">
              Generate a shareable 1080x1080 image of your predictions and championship standings.
            </p>
          </div>

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
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-md transition font-semibold ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>

          {isLoading && (
            <div className="mt-4">
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
