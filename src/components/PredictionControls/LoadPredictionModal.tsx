import React, { useState, useRef, useEffect } from 'react';
import './modalStyles.css';

interface LoadPredictionModalProps {
  onLoad: (id: string) => void;
  onClose: () => void;
  error: string | null;
  history: string[];
}

const LoadPredictionModal: React.FC<LoadPredictionModalProps> = ({ 
  onLoad, 
  onClose, 
  error,
  history 
}) => {
  const [predictionId, setPredictionId] = useState('');
  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPredictionId(e.target.value);
    if (inputError) {
      setInputError(false);
    }
  };

  // Handle load button click
  const handleLoad = () => {
    if (!predictionId.trim()) {
      setInputError(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }
    
    onLoad(predictionId);
  };

  // Handle pressing Enter in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoad();
    }
  };

  // Handle loading a prediction from history
  const handleLoadFromHistory = (id: string) => {
    onLoad(id);
  };

  return (
    <div className="prediction-modal-overlay">
      <div className="prediction-modal">
        <div className="modal-header">
          <h3>Load Prediction</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="id-input-section">
            <p>Enter a prediction ID:</p>
            <div className="id-input-container">
              <input 
                ref={inputRef}
                type="text" 
                value={predictionId}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className={`id-input ${inputError ? 'error' : ''}`}
                placeholder="Enter prediction ID"
              />
              <button 
                className="load-button"
                onClick={handleLoad}
              >
                Load
              </button>
            </div>
            {inputError && (
              <p className="input-error-message">Please enter a prediction ID</p>
            )}
          </div>
          
          {history.length > 0 && (
            <div className="history-section">
              <h4>Recent Predictions</h4>
              <ul className="prediction-history">
                {history.map((id) => (
                  <li key={id}>
                    <span className="history-id">{id}</span>
                    <button 
                      className="load-history-item"
                      onClick={() => handleLoadFromHistory(id)}
                    >
                      Load
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="close-modal-button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default LoadPredictionModal;