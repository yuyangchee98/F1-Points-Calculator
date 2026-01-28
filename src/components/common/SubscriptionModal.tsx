import React, { useState, useEffect } from 'react';
import { createCheckoutSession, AccessTier } from '../../api/subscription';
import { trackSubscriptionAction } from '../../utils/analytics';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailChange: (email: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  email,
  onEmailChange
}) => {
  const [localEmail, setLocalEmail] = useState(email);
  const [selectedTier, setSelectedTier] = useState<AccessTier>('season');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackSubscriptionAction('OPEN_MODAL');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!localEmail || !localEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    trackSubscriptionAction('CLICK_SUBSCRIBE', `${selectedTier}_${localEmail}`);
    setIsLoading(true);
    try {
      onEmailChange(localEmail);
      const session = await createCheckoutSession(localEmail, selectedTier);
      window.location.href = session.url;
    } catch (error) {
      alert('Failed to start checkout process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Unlock Community Consensus</h2>
          <p className="text-gray-600 mb-6">See what other fans predict before you lock in</p>

          <div className="mb-6 space-y-3">
            <button
              onClick={() => setSelectedTier('season')}
              className={`w-full p-4 rounded-lg border-2 text-left transition ${
                selectedTier === 'season'
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">Season Pass</p>
                  <p className="text-sm text-gray-600">Full 2026 season access</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">$15</p>
                  <p className="text-xs text-green-600 font-medium">Best value</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedTier('week')}
              className={`w-full p-4 rounded-lg border-2 text-left transition ${
                selectedTier === 'week'
                  ? 'border-red-600 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">1 Week</p>
                  <p className="text-sm text-gray-600">7 days from purchase</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$3</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mb-6 text-left bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What you get:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• See community prediction percentages</li>
              <li>• Know what % picked each driver for each position</li>
              <li>• Make informed predictions before locking in</li>
            </ul>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Email address
            </label>
            <input
              type="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Your access will be tied to this email
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                trackSubscriptionAction('CLOSE_MODAL', 'cancel_button');
                onClose();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !localEmail}
              className={`flex-1 px-4 py-2 rounded-md transition font-semibold ${
                isLoading || !localEmail
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Processing...' : `Get Access - $${selectedTier === 'season' ? '15' : '3'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
