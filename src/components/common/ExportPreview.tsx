import React, { useState, useEffect, useRef } from 'react';
import { ExportData } from '../../utils/exportFormatter';

interface ExportPreviewProps {
  data: ExportData;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({ data }) => {
  const { races, grids, standings, drivers, teams } = data;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Calculate optimal scale based on container size
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;

      // Canvas dimensions
      const canvasWidth = 1080;
      const canvasHeight = 1080;

      // Add padding buffer (40px total - 20px on each side)
      const paddingBuffer = 40;

      // Calculate scale to fit both dimensions
      const scaleX = (availableWidth - paddingBuffer) / canvasWidth;
      const scaleY = (availableHeight - paddingBuffer) / canvasHeight;

      // Use the smaller scale to ensure it fits, and never scale above 1
      const optimalScale = Math.min(scaleX, scaleY, 1);

      setScale(optimalScale);
    };

    // Calculate on mount
    calculateScale();

    // Observe container resize
    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', calculateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
    >
      {/* Scale container to fit preview area */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {/* Exact copy of backend template */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1080px',
            height: '1080px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
            padding: '28px',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {/* Main Layout: Vertical Sections */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {/* Title and Subtitle */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginBottom: '24px',
                gap: '6px',
              }}
            >
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {data.title || 'My F1 Predictions'}
              </h1>
              {data.subtitle && (
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {data.subtitle}
                </p>
              )}
            </div>

            {/* Race Grid Section */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
              }}
            >
              {/* Position/Points Index Column */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '50px',
                }}
              >
                {/* Empty header space */}
                <div
                  style={{
                    height: '62px',
                    marginBottom: '8px',
                  }}
                />

                {/* Position/Points rows */}
                {[
                  { pos: 1, pts: 25 },
                  { pos: 2, pts: 18 },
                  { pos: 3, pts: 15 },
                  { pos: 4, pts: 12 },
                  { pos: 5, pts: 10 },
                ].map((item) => (
                  <div
                    key={item.pos}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px',
                      height: '80px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1f2937',
                      }}
                    >
                      {item.pos}
                    </span>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: '600',
                        color: '#9ca3af',
                      }}
                    >
                      {item.pts}pt
                    </span>
                  </div>
                ))}
              </div>

              {/* Race Columns */}
              {(() => {
                const completedRaces = races.filter(r => r.completed).slice(0, 1);
                const predictionRaces = races.filter(r => !r.completed).slice(0, 5 - completedRaces.length);
                return [...completedRaces, ...predictionRaces];
              })().map((race) => {
                const raceGrid = grids[race.raceId] || [];
                const isCompleted = race.completed;

                return (
                  <div
                    key={race.raceId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      maxWidth: '160px',
                    }}
                  >
                    {/* Race Header */}
                    <div
                      style={{
                        fontWeight: '700',
                        color: '#ffffff',
                        background: isCompleted ? '#16a34a' : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                        padding: '12px 10px',
                        textAlign: 'center',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        boxShadow: isCompleted ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)' : '0 6px 16px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '4px',
                        height: '62px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: isCompleted ? '11px' : '12px',
                        }}
                      >
                        {race.flag && <span style={{ fontSize: isCompleted ? '14px' : '16px' }}>{race.flag}</span>}
                        {race.name}
                      </div>
                      {!isCompleted && (
                        <div
                          style={{
                            fontSize: '8px',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.85)',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Prediction
                        </div>
                      )}
                    </div>

                    {/* Grid Positions */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {[1, 2, 3, 4, 5].map((position) => {
                        const gridPos = raceGrid.find(gp => gp.position === position);

                        // If no driver for this position, render empty invisible slot
                        if (!gridPos) {
                          return (
                            <div
                              key={position}
                              style={{
                                height: '80px',
                              }}
                            />
                          );
                        }

                        const driver = drivers[gridPos.driverId];
                        const team = teams[driver?.teamId];
                        const teamColor = team?.color || '#9ca3af';

                        return (
                          <div
                            key={gridPos.position}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              background: isCompleted ? '#f0fdf4' : '#ffffff',
                              borderRadius: '6px',
                              border: isCompleted ? '2px solid #86efac' : '1px solid #e5e7eb',
                              boxShadow: isCompleted ? '0 2px 8px rgba(134, 239, 172, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)' : '0 2px 4px rgba(0, 0, 0, 0.08)',
                              height: '80px',
                              overflow: 'hidden',
                              opacity: isCompleted ? 0.4 : 1,
                              filter: isCompleted ? 'blur(1px)' : 'none',
                            }}
                          >
                            {/* Inner Driver Card */}
                            <div
                              style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '12px',
                                background: isCompleted ? '#f0fdf4' : '#ffffff',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                zIndex: 1,
                              }}
                            >
                              {/* Team Color Left Border */}
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '4px',
                                  background: teamColor,
                                  display: 'flex',
                                }}
                              />

                              {/* Team Color Gradient Overlay */}
                              <div
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '33%',
                                  background: `linear-gradient(to right, ${teamColor} 0%, transparent 100%)`,
                                  opacity: 0.1,
                                  display: 'flex',
                                }}
                              />

                              {/* Content */}
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  marginLeft: '12px',
                                  flexGrow: 1,
                                  position: 'relative',
                                  zIndex: 1,
                                }}
                              >
                                {/* Driver Name */}
                                <span
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    color: '#000000',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {driver?.name || gridPos.driverId.toUpperCase()}
                                </span>
                                {/* Team Name */}
                                <span
                                  style={{
                                    fontSize: '11px',
                                    color: teamColor,
                                    fontWeight: '400',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {team?.name || ''}
                                </span>
                              </div>
                            </div>

                            {/* Diagonal Stripe Effect for Completed Races - renders on top */}
                            {isCompleted && (
                              <div
                                style={{
                                  position: 'absolute',
                                  inset: 0,
                                  backgroundImage: 'linear-gradient(-45deg, transparent 0%, transparent 10%, rgba(134, 239, 172, 0.2) 10%, rgba(134, 239, 172, 0.2) 20%, transparent 20%, transparent 30%, rgba(134, 239, 172, 0.2) 30%, rgba(134, 239, 172, 0.2) 40%, transparent 40%, transparent 50%, rgba(134, 239, 172, 0.2) 50%, rgba(134, 239, 172, 0.2) 60%, transparent 60%, transparent 70%, rgba(134, 239, 172, 0.2) 70%, rgba(134, 239, 172, 0.2) 80%, transparent 80%, transparent 90%, rgba(134, 239, 172, 0.2) 90%, rgba(134, 239, 172, 0.2) 100%)',
                                  borderRadius: '6px',
                                  pointerEvents: 'none',
                                  display: 'flex',
                                  zIndex: 2,
                                }}
                              />
                            )}

                            {/* Points Gained Badge - only for predictions (not completed races) */}
                            {!isCompleted && gridPos.pointsGained !== undefined && gridPos.pointsGained > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '6px',
                                  right: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '4px 8px',
                                  background: '#00d084',
                                  borderRadius: '6px',
                                  zIndex: 3,
                                  boxShadow: '0 2px 6px rgba(0, 208, 132, 0.4)',
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  +{gridPos.pointsGained}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flow Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  Results In
                </span>
                <span style={{ fontSize: '22px', color: '#ffffff' }}>⬇</span>
              </div>
            </div>

            {/* Championship Standings Section */}
            {/* Section Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '24px',
                  background: '#dc2626',
                  borderRadius: '2px',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#1f2937',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Championship Standings
              </span>
            </div>

            {/* Championship Standings Table */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
            >
              {/* Column Headers */}
              <div
                style={{
                  display: 'flex',
                  padding: '12px 20px',
                  borderBottom: '2px solid #e5e7eb',
                  background: '#f9fafb',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    display: 'flex',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Pos
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    display: 'flex',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Driver
                </div>
                <div
                  style={{
                    width: '100px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textAlign: 'right',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Points
                </div>
              </div>

              {/* Standings Rows */}
              {standings.slice(0, 3).map((standing, index) => {
                const driver = drivers[standing.driverId];
                const team = teams[driver?.teamId];
                const teamColor = team?.color || '#9ca3af';

                return (
                  <div
                    key={standing.driverId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: index < 2 ? '1px solid #f3f4f6' : 'none',
                      background: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                    }}
                  >
                    {/* Position with change indicator */}
                    <div
                      style={{
                        width: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#1f2937',
                        }}
                      >
                        {standing.position}
                      </span>
                      {standing.positionChange !== undefined && standing.positionChange !== 0 && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: standing.positionChange > 0 ? '#10b981' : '#ef4444',
                          }}
                        >
                          {standing.positionChange > 0 ? '↑' : '↓'}{Math.abs(standing.positionChange)}
                        </span>
                      )}
                    </div>

                    {/* Driver with team color bar and name */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '4px',
                          height: '32px',
                          background: teamColor,
                          borderRadius: '2px',
                          display: 'flex',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#1f2937',
                          }}
                        >
                          {driver?.name || standing.driverId}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '400',
                            color: teamColor,
                          }}
                        >
                          {team?.name || ''}
                        </span>
                      </div>
                    </div>

                    {/* Points with gained indicator */}
                    <div
                      style={{
                        width: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                        }}
                      >
                        {standing.points}
                      </span>
                      {standing.pointsGained !== undefined && standing.pointsGained > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color: '#10b981',
                            background: '#d1fae5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          +{standing.pointsGained}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Watermark */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '14px',
              fontSize: '11px',
              color: 'rgba(107, 114, 128, 0.6)',
            }}
          >
            Created with F1 Points Calculator
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPreview;
