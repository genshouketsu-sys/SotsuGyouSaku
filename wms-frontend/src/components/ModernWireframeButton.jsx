import React from 'react';
import './ModernWireframeButton.css';

/**
 * ModernWireframeButton Component
 * 
 * A high-design outline button designed for guide pages and landing CTAs.
 * Features:
 * - Glassmorphism backdrop
 * - Neon glow on hover
 * - Smooth state transitions
 * - Sliding light animation
 */
const ModernWireframeButton = ({ 
  text = 'GET STARTED', 
  onClick, 
  className = '', 
  showIcon = true 
}) => {
  return (
    <button 
      className={`modern-wireframe-btn ${className}`} 
      onClick={onClick}
    >
      <span className="btn-text">{text}</span>
      {showIcon && (
        <svg 
          className="btn-icon" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      )}
    </button>
  );
};

export default ModernWireframeButton;
