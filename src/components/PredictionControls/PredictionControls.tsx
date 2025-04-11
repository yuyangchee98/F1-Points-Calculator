import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  setPredictionDialog,
  setShareableLink,
  setShowingCommunityPredictions,
  setPredictionError
} from '../../store/slices/uiSlice';
import {
  saveGridPrediction,
  loadGridPrediction,
  checkUrlForPrediction,
  fetchCommunityPredictions,
  resetSharedPrediction
} from '../../store/thunks/predictionThunks';
import { getPredictionHistory } from '../../utils/api/prediction/userManager';
import ShareLinkModal from './ShareLinkModal';
import LoadPredictionModal from './LoadPredictionModal';
import CommunityBanner from './CommunityBanner';
import './predictionControls.css';

const PredictionControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    shareableLink,
    showingPredictionDialog,
    predictionDialogType,
    predictionLoading,
    predictionError,
    isShowingCommunityPredictions,
    communityPredictionStats
  } = useSelector((state: RootState) => state.ui);

  // Check URL for prediction param on initial load
  useEffect(() => {
    dispatch(checkUrlForPrediction());
  }, [dispatch]);

  // Handle save button click
  const handleSave = () => {
    dispatch(saveGridPrediction())
      .unwrap()
      .then(() => {
        dispatch(setPredictionDialog({ show: true, type: 'save' }));
      })
      .catch((error: any) => {
        dispatch(setPredictionError(error.toString()));
      });
  };

  // Handle load button click
  const handleLoad = () => {
    dispatch(setPredictionDialog({ show: true, type: 'load' }));
  };

  // Handle load prediction by ID
  const handleLoadById = (id: string) => {
    dispatch(loadGridPrediction(id))
      .unwrap()
      .then(() => {
        dispatch(setPredictionDialog({ show: false }));
      })
      .catch((error: any) => {
        dispatch(setPredictionError(error.toString()));
      });
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    dispatch(setPredictionDialog({ show: false }));
    dispatch(setShareableLink(null));
    dispatch(setPredictionError(null));
  };

  // Toggle community predictions
  const handleToggleCommunity = () => {
    if (isShowingCommunityPredictions) {
      // Turn off community predictions
      dispatch(setShowingCommunityPredictions(false));
      dispatch(resetSharedPrediction());
    } else {
      // Turn on community predictions
      dispatch(fetchCommunityPredictions())
        .unwrap()
        .then(() => {
          dispatch(setShowingCommunityPredictions(true));
        })
        .catch((error: any) => {
          dispatch(setPredictionError(error.toString()));
        });
    }
  };

  return (
    <div className="prediction-controls">
      {/* Community Banner - shown when viewing community predictions */}
      {isShowingCommunityPredictions && communityPredictionStats && (
        <CommunityBanner
          totalPredictions={communityPredictionStats.totalPredictions}
          updatedAt={communityPredictionStats.updatedAt}
          onClose={() => handleToggleCommunity()}
        />
      )}

      {/* Control Buttons */}
      <div className="prediction-buttons animate-fade-in">
        <button
          className="prediction-button save-button"
          onClick={handleSave}
          disabled={predictionLoading || isShowingCommunityPredictions}
        >
          <span className="button-icon">📊</span>
          <span className="button-text">Save Prediction</span>
        </button>

        <button
          className="prediction-button load-button"
          onClick={handleLoad}
          disabled={predictionLoading || isShowingCommunityPredictions}
        >
          <span className="button-icon">📝</span>
          <span className="button-text">Load Prediction</span>
        </button>

        <button
          className={`prediction-button community-button ${isShowingCommunityPredictions ? 'active' : ''}`}
          onClick={handleToggleCommunity}
          disabled={predictionLoading}
        >
          <span className="button-icon">🌎</span>
          <span className="button-text">
            {isShowingCommunityPredictions ? 'Hide Community Predictions' : 'Show Community Predictions'}
          </span>
        </button>
      </div>

      {/* Prediction Share Dialog */}
      {showingPredictionDialog && predictionDialogType === 'save' && shareableLink && (
        <ShareLinkModal
          link={shareableLink}
          onClose={handleCloseDialog}
        />
      )}

      {/* Prediction Load Dialog */}
      {showingPredictionDialog && predictionDialogType === 'load' && (
        <LoadPredictionModal
          onLoad={handleLoadById}
          onClose={handleCloseDialog}
          error={predictionError}
          history={getPredictionHistory()}
        />
      )}
    </div>
  );
};

export default PredictionControls;