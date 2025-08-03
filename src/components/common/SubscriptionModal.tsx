import React, { useState, useEffect } from 'react';
import { createCheckoutSession, checkSessionStatus } from '../../api/subscription';
import { trackSmartInputAction } from '../../utils/analytics';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      trackSmartInputAction('OPEN_SUBSCRIPTION_MODAL');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!localEmail || !localEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    trackSmartInputAction('CLICK_SUBSCRIBE', localEmail);
    setIsLoading(true);
    try {
      onEmailChange(localEmail);
      const session = await createCheckoutSession(localEmail);
      
      // Start polling for session completion
      const pollInterval = setInterval(async () => {
        try {
          const status = await checkSessionStatus(session.sessionId);
          if (status.completed) {
            clearInterval(pollInterval);
            // Clear all subscription cache
            Object.keys(localStorage).forEach(key => {
              if (key.includes('f1_smart_input_subscription')) {
                localStorage.removeItem(key);
              }
            });
            // Reload to refresh subscription status
            window.location.reload();
          }
        } catch (err) {
          // Continue polling
        }
      }, 2000); // Check every 2 seconds
      
      // Stop polling after 10 minutes
      setTimeout(() => clearInterval(pollInterval), 600000);
      
      // Redirect to Stripe
      window.location.href = session.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unlock Smart Input</h2>
          
          <div className="mb-6">
            <p className="text-4xl font-bold text-red-600 mb-2">$4.99</p>
            <p className="text-gray-600">per month</p>
          </div>

          <div className="mb-6 text-left">
            <h3 className="font-semibold mb-2">What you get:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Natural language predictions</li>
              <li>• Instant grid updates</li>
              <li>• Save hours of clicking</li>
              <li>• Works across all devices</li>
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
              Your subscription will be tied to this email
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                trackSmartInputAction('CLOSE_SUBSCRIPTION_MODAL', 'cancel_button');
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
              {isLoading ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;