import React from 'react';
import ModernWireframeButton from './ModernWireframeButton';

const ButtonDemo = () => {
  return (
    <div style={{
      backgroundColor: '#121414',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '40px'
    }}>
      <h1 style={{ color: 'white', fontFamily: 'sans-serif' }}>Button Showcase</h1>
      
      {/* Normal View */}
      <ModernWireframeButton 
        text="Explore System" 
        onClick={() => alert('Clicked!')} 
      />

      {/* Without Icon */}
      <ModernWireframeButton 
        text="Learn More" 
        showIcon={false}
        onClick={() => console.log('Learn more')}
      />

      <p style={{ color: '#666', fontSize: '0.9rem' }}>Hover over the buttons to see the effects</p>
    </div>
  );
};

export default ButtonDemo;
