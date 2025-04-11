import React, { useState, useRef, useEffect } from 'react';
import './modalStyles.css';

interface ShareLinkModalProps {
  link: string;
  onClose: () => void;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ link, onClose }) => {
  const [copied, setCopied] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const predictionId = new URL(link).searchParams.get('prediction') || '';

  // Select the link text on modal open
  useEffect(() => {
    if (linkInputRef.current) {
      linkInputRef.current.focus();
      linkInputRef.current.select();
    }
  }, []);

  // Handle copy to clipboard
  const handleCopy = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      document.execCommand('copy');
      // or use modern clipboard API if available
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).catch(err => {
          console.error('Failed to copy with Clipboard API:', err);
        });
      }
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="prediction-modal-overlay">
      <div className="prediction-modal">
        <div className="modal-header">
          <h3>Prediction Saved!</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <p>Your prediction has been saved. Share it with this link:</p>
          
          <div className="share-link-container">
            <input 
              ref={linkInputRef}
              type="text" 
              readOnly 
              value={link} 
              className="share-link-input"
              onClick={(e) => e.currentTarget.select()}
            />
            <button 
              className="copy-button"
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="prediction-id-section">
            <p>
              <span>Prediction ID: </span>
              <strong>{predictionId}</strong>
            </p>
            <p className="helper-text">
              Save this ID if you want to load this prediction later.
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="close-modal-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;