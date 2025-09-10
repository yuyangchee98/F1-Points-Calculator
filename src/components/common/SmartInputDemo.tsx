import React, { useState, useEffect } from 'react';

const SmartInputDemo: React.FC = () => {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const [driversVisible, setDriversVisible] = useState(false);
  
  const command = "Ferrari 1-2 at Italian GP";
  
  // Driver data matching EXACTLY the webapp
  const drivers = {
    HAM: { name: 'HAMILTON', team: 'Ferrari', color: '#DC0000' },
    LEC: { name: 'LECLERC', team: 'Ferrari', color: '#DC0000' },
  };
  
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
  }, []);
  
  // Cursor blink effect
  const [cursorVisible, setCursorVisible] = useState(true);
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);
  
  // EXACT driver card from the video/webapp
  const renderDriverCard = (driverCode: string, opacity: number = 1) => {
    const driver = drivers[driverCode as keyof typeof drivers];
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
          transitionDelay: opacity === 1 ? '0ms' : '100ms',
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
  
  return (
    <div style={{ width: '380px', maxWidth: '100%', margin: '0 auto' }}>
      {/* Input Box - EXACT from video */}
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

      {/* Race Grid - EXACT from video */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px repeat(3, 105px)',
          gap: '8px',
          gridTemplateRows: 'auto auto auto',
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
        
        {/* Previous races headers - blurred */}
        {[
          { name: 'Dutch', code: 'NED' },
          { name: 'Belgian', code: 'BEL' },
        ].map((race) => (
          <div 
            key={race.code}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              opacity: 0.5,
              filter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: '12px' }}>{race.code}</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{race.name}</div>
          </div>
        ))}
        
        {/* Italian GP header */}
        <div style={{
          backgroundColor: '#DC0000',
          color: 'white',
          padding: '8px',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
        }}>
          <div style={{ fontSize: '12px' }}>ITA</div>
          <div style={{ fontSize: '10px', opacity: 0.9 }}>Italian</div>
        </div>
        
        {/* P1 and P2 rows */}
        {[1, 2].map((position) => {
          const italianDriver = position === 1 ? 'HAM' : 'LEC';

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
                {position}
              </div>
              
              {/* Dutch position - empty/blurred cells */}
              <div
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  minHeight: '45px',
                  padding: '8px',
                  filter: 'blur(10px)',
                  opacity: 0.3,
                }}
              >
                <div style={{
                  backgroundColor: '#f3f4f6',
                  height: '100%',
                  borderRadius: '4px',
                }} />
              </div>

              {/* Belgian position - empty/blurred cells */}
              <div
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  minHeight: '45px',
                  padding: '8px',
                  filter: 'blur(10px)',
                  opacity: 0.3,
                }}
              >
                <div style={{
                  backgroundColor: '#f3f4f6',
                  height: '100%',
                  borderRadius: '4px',
                }} />
              </div>
              
              {/* Italian position - starts empty, then Ferrari drivers appear */}
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                height: '48px',
                padding: '3px',
                position: 'relative',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}>
                {renderDriverCard(italianDriver, position === 1 ? 1 : 0.9)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SmartInputDemo;