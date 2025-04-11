import React from 'react';
import './communityBanner.css';

interface CommunityBannerProps {
  totalPredictions: number;
  updatedAt: string;
  onClose: () => void;
}

const CommunityBanner: React.FC<CommunityBannerProps> = ({
  totalPredictions,
  updatedAt,
  onClose
}) => {
  // Format the date
  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="community-banner">
      <div className="banner-content">
        <h3>Community Predictions</h3>
        <p>
          Showing the most common predictions from <strong>{totalPredictions.toLocaleString()}</strong> users
        </p>
        <p className="updated-date">Last updated: {formattedDate}</p>
      </div>
      <button onClick={onClose} className="banner-close-button">
        Return to My Predictions
      </button>
    </div>
  );
};

export default CommunityBanner;