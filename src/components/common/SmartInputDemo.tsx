import React, { useState, useEffect } from 'react';
import { DemoConfig } from './demos/FerrariItalianDemo';
import { FerrariItalianDemo } from './demos/FerrariItalianDemo';
import { NorrisRemainingDemo } from './demos/NorrisRemainingDemo';
import { MaxNext3Demo } from './demos/MaxNext3Demo';
import { McLarenSprintsDemo } from './demos/McLarenSprintsDemo';
import { AlonsoSpainDemo } from './demos/AlonsoSpainDemo';
import { ColapintoPointsDemo } from './demos/ColapintoPointsDemo';

const demos: DemoConfig[] = [
  FerrariItalianDemo,
  NorrisRemainingDemo,
  MaxNext3Demo,
  McLarenSprintsDemo,
  AlonsoSpainDemo,
  ColapintoPointsDemo
];

const SmartInputDemo: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [driversVisible, setDriversVisible] = useState(false);
  
  // Randomly select a demo on mount
  const [currentDemo] = useState(() => {
    const randomIndex = Math.floor(Math.random() * demos.length);
    return demos[randomIndex];
  });
  
  const command = currentDemo.command;
  
  useEffect(() => {
    // Start typing after a short delay
    const startDelay = setTimeout(() => {
      setShowCursor(true);
      
      // Type out the command
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= command.length) {
          setTypedText(command.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setShowCursor(false);
          
          // Show drivers after typing completes
          setTimeout(() => {
            setDriversVisible(true);
          }, 500);
        }
      }, 60);
      
      return () => clearInterval(typingInterval);
    }, 500);
    
    // Reset animation every 5 seconds
    const resetInterval = setInterval(() => {
      setTypedText('');
      setShowCursor(false);
      setDriversVisible(false);
      
      // Restart animation after brief pause
      setTimeout(() => {
        setShowCursor(true);
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
          if (currentIndex <= command.length) {
            setTypedText(command.slice(0, currentIndex));
            currentIndex++;
          } else {
            clearInterval(typingInterval);
            setShowCursor(false);
            setTimeout(() => {
              setDriversVisible(true);
            }, 500);
          }
        }, 60);
      }, 500);
    }, 5000);
    
    return () => {
      clearTimeout(startDelay);
      clearInterval(resetInterval);
    };
  }, [command]);
  
  // Cursor blink effect
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Render driver card based on position
  const renderDriverCard = (position: string, raceIndex: number) => {
    const race = currentDemo.races[raceIndex];
    // Check for race-specific driver first
    const raceSpecificKey = `${race.code}-${position}`;
    const driver = currentDemo.drivers[raceSpecificKey] || currentDemo.drivers[position];
    if (!driver) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '6px',
          overflow: 'hidden',
          borderLeft: driversVisible ? `4px solid ${driver.color}` : '4px solid transparent',
          backgroundColor: 'white',
          padding: '8px',
          width: '100%',
          height: '100%',
          position: 'relative',
          opacity: driversVisible ? 1 : 0,
          transform: driversVisible 
            ? 'scale(1)' 
            : 'scale(0.95)',
          transition: 'all 0.4s ease-out',
          transitionDelay: `${raceIndex * 100}ms`,
          boxSizing: 'border-box',
        }}>
        {/* Team color gradient overlay - matching webapp exactly */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '33.33%',
            opacity: 0.1,
            background: `linear-gradient(to right, ${driver.color} 0%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />
        
        {/* Driver info */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '8px',
          flexGrow: 1,
          zIndex: 1,
          textAlign: 'left',
        }}>
          <span style={{ 
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#111827',
          }}>
            {driver.name}
          </span>
          <span style={{ 
            fontSize: '9px',
            color: driver.color,
          }}>
            {driver.team}
          </span>
        </div>
      </div>
    );
  };
  
  // Calculate grid dimensions based on demo
  const gridColumns = currentDemo.races.length;
  const gridRows = currentDemo.positions.length;
  
  return (
    <div style={{ width: '380px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Input Box */}
      <div style={{ position: 'relative', marginBottom: '15px', height: '38px' }}>
        <div
          style={{
            background: '#f9fafb',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            padding: '7px 11px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              color: typedText ? '#111827' : '#9ca3af',
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
            }}
          >
            {typedText || (!showCursor ? 'Type a command...' : '')}
            {showCursor && cursorVisible && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '18px',
                  background: '#3b82f6',
                  marginLeft: '2px',
                }}
              />
            )}
          </span>
        </div>
        
      </div>

      {/* Race Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `70px repeat(${gridColumns}, 105px)`,
          gap: '8px',
          gridTemplateRows: `auto repeat(${gridRows}, auto)`,
        }}
      >
        {/* Headers */}
        <div style={{
          backgroundColor: '#374151',
          color: 'white',
          padding: '8px',
          borderRadius: '6px',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '11px',
        }}>
          Position
        </div>
        
        {/* Race headers */}
        {currentDemo.races.map((race) => (
          <div 
            key={race.code}
            style={{
              backgroundColor: race.blur ? '#6b7280' : '#374151',
              color: 'white',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '11px',
              opacity: race.blur ? 0.5 : 1,
              filter: race.blur ? 'blur(8px)' : 'none',
            }}
          >
            {race.flag && `${race.flag} `}{race.name}
          </div>
        ))}
        
        {/* Position rows */}
        {currentDemo.positions.map((position, posIndex) => {
          const posNumber = parseInt(position.replace('P', ''));
          
          return (
            <React.Fragment key={position}>
              {/* Position number */}
              <div style={{
                backgroundColor: '#f3f4f6',
                padding: '8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#374151',
              }}>
                {posNumber}
              </div>
              
              {/* Race cells */}
              {currentDemo.races.map((race, raceIndex) => (
                <div
                  key={`${race.code}-${position}`}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    height: '48px',
                    padding: race.blur ? '8px' : '3px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    filter: race.blur ? 'blur(10px)' : 'none',
                    opacity: race.blur ? 0.3 : 1,
                  }}
                >
                  {race.blur ? (
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      height: '100%',
                      borderRadius: '4px',
                    }} />
                  ) : (
                    renderDriverCard(position, raceIndex)
                  )}
                </div>
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SmartInputDemo;