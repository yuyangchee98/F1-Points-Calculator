import React, { useState, useEffect } from 'react';
import { createCheckoutSession, openCustomerPortal, AccessTier } from '../../api/subscription';
import { trackSubscriptionAction } from '../../utils/analytics';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onEmailChange: (email: string) => void;
  hasAccess?: boolean;
  currentTier?: AccessTier | null;
  expiresAt?: number | null;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  email,
  onEmailChange,
  hasAccess = false,
  currentTier = null,
  expiresAt = null,
}) => {
  const [localEmail, setLocalEmail] = useState(email);
  const [selectedTier, setSelectedTier] = useState<AccessTier>('season');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackSubscriptionAction('OPEN_MODAL');
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalEmail(email);
  }, [email]);

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

  const handleManageSubscription = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await openCustomerPortal(email);
    } catch (error) {
      alert('Failed to open subscription management. Please try again.');
      setIsLoading(false);
    }
  };

  const formatExpiryDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show management view if user has access
  if (hasAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Consensus Active</h2>
            <p className="text-gray-600 mb-4">
              You have access to community consensus data.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{currentTier === 'season' ? 'Season Pass' : '1 Week'}</span>
              </div>
              {expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{currentTier === 'season' ? 'Renews:' : 'Expires:'}</span>
                  <span className="font-medium">{formatExpiryDate(expiresAt)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition font-medium"
              >
                {isLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show purchase view if user doesn't have access
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
                  <p className="text-sm text-gray-600">$15/year, cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">$15<span className="text-sm font-normal">/yr</span></p>
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
