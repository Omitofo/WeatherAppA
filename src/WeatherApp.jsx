//src/WeatherApp.jsx

import React, { useState, useEffect } from 'react';

// Redesigned: Modern, clean interface with better space utilization
// Light background with subtle gradients, organized grid layout
// Responsive: 2-column desktop → 1-column tablet/mobile

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [themeColor, setThemeColor] = useState('#00ff41');

  const colorThemes = [
    { name: 'NEON', color: '#00ff41', label: 'GRN' },
    { name: 'CYAN', color: '#00d9ff', label: 'CYN' },
    { name: 'PINK', color: '#ff006e', label: 'PNK' },
    { name: 'AMBER', color: '#ffbe0b', label: 'AMB' },
    { name: 'ORANGE', color: '#fb5607', label: 'ORG' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const searchWeather = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/Weather?city=${encodeURIComponent(location)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Location not found');
      }
      
      const data = await response.json();
      setWeather(data);
      setLocation('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') searchWeather();
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: '☀',
      Clouds: '☁',
      Rain: '🌧',
      Drizzle: '🌦',
      Thunderstorm: '⛈',
      Snow: '❄',
      Mist: '🌫',
      Smoke: '💨',
      Haze: '🌫',
      Dust: '💨',
      Fog: '🌫',
    };
    return icons[condition] || '🌡';
  };

  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      fontFamily: '"Courier New", Courier, monospace',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Subtle texture overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.02\'/%3E%3C/svg%3E")',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        position: 'relative',
        padding: '0 1rem'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                margin: 0,
                color: '#1a1f3a',
                textShadow: `0 0 20px ${hexToRgba(themeColor, 0.3)}`,
                letterSpacing: '0.1em',
                fontWeight: 'bold'
              }}>
                WEATHER.SYS
              </h1>
              <div style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem'
              }}>
                {'>'} Meteorological Data Terminal v2.024
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {/* Theme selector */}
              <div style={{
                display: 'flex',
                gap: '0.5rem'
              }}>
                {colorThemes.map((theme) => (
                  <button
                    key={theme.color}
                    onClick={() => setThemeColor(theme.color)}
                    title={theme.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: themeColor === theme.color 
                        ? `2px solid ${theme.color}` 
                        : '2px solid transparent',
                      background: theme.color,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      color: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: themeColor === theme.color 
                        ? `0 0 16px ${hexToRgba(theme.color, 0.5)}` 
                        : '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transform: themeColor === theme.color ? 'scale(1.1)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = `0 0 16px ${hexToRgba(theme.color, 0.5)}`;
                    }}
                    onMouseLeave={(e) => {
                      if (themeColor !== theme.color) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                      }
                    }}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>

              {/* Time display */}
              <div style={{
                fontSize: '1rem',
                color: themeColor,
                fontWeight: 'bold',
                padding: '0.5rem 1rem',
                background: hexToRgba(themeColor, 0.1),
                borderRadius: '6px',
                border: `1px solid ${hexToRgba(themeColor, 0.3)}`
              }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            fontSize: '0.85rem',
            marginBottom: '0.75rem',
            color: '#4b5563',
            fontWeight: '600'
          }}>
            {'>'} ENTER LOCATION:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="City name..."
              style={{
                flex: '1 1 300px',
                background: 'white',
                border: `2px solid ${hexToRgba(themeColor, 0.3)}`,
                color: '#1a1f3a',
                padding: '0.875rem 1.25rem',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = themeColor;
                e.target.style.boxShadow = `0 0 0 3px ${hexToRgba(themeColor, 0.1)}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = hexToRgba(themeColor, 0.3);
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={searchWeather}
              disabled={loading}
              style={{
                background: themeColor,
                border: 'none',
                color: 'white',
                padding: '0.875rem 2rem',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1,
                boxShadow: `0 4px 12px ${hexToRgba(themeColor, 0.3)}`,
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 6px 16px ${hexToRgba(themeColor, 0.4)}`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = `0 4px 12px ${hexToRgba(themeColor, 0.3)}`;
              }}
            >
              {loading ? 'SCANNING...' : 'EXECUTE'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            color: '#dc2626',
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            borderRadius: '8px',
            fontWeight: '600'
          }}>
            {'>'} ERROR: {error.toUpperCase()}
          </div>
        )}

        {/* Weather Display - NEW LAYOUT */}
        {weather && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '2rem',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {/* Left Column: Main Weather */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Hero Card */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: `2px solid ${hexToRgba(themeColor, 0.2)}`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Accent gradient */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${themeColor}, ${hexToRgba(themeColor, 0.5)})`
                }} />

                <div style={{
                  fontSize: '0.9rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  LOCATION: {weather.name.toUpperCase()}, {weather.sys.country}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    fontSize: '6rem',
                    lineHeight: 1,
                    filter: `drop-shadow(0 4px 12px ${hexToRgba(themeColor, 0.3)})`
                  }}>
                    {getWeatherIcon(weather.weather[0].main)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '5rem',
                      fontWeight: 'bold',
                      lineHeight: 1,
                      color: '#1a1f3a',
                      textShadow: `2px 2px 0 ${hexToRgba(themeColor, 0.1)}`
                    }}>
                      {Math.round(weather.main.temp)}°
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      color: '#4b5563',
                      marginTop: '0.5rem',
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      {weather.weather[0].description}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: `1px solid ${hexToRgba(themeColor, 0.2)}`
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      FEELS LIKE
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                      {Math.round(weather.main.feels_like)}°C
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      HUMIDITY
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                      {weather.main.humidity}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Sun times */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', fontWeight: '600' }}>
                  {'>'} SUN DATA
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      SUNRISE
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                      {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                      SUNSET
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                      {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Details Grid */}
            <div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                height: '100%'
              }}>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  fontWeight: '600'
                }}>
                  {'>'} DETAILED METRICS
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {[
                    { label: 'PRESSURE', value: `${weather.main.pressure}`, unit: 'hPa' },
                    { label: 'WIND', value: `${weather.wind.speed}`, unit: 'm/s' },
                    { label: 'MIN TEMP', value: `${Math.round(weather.main.temp_min)}`, unit: '°C' },
                    { label: 'MAX TEMP', value: `${Math.round(weather.main.temp_max)}`, unit: '°C' },
                    { label: 'VISIBILITY', value: `${(weather.visibility / 1000).toFixed(1)}`, unit: 'km' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '1.25rem',
                        background: hexToRgba(themeColor, 0.05),
                        borderRadius: '8px',
                        border: `1px solid ${hexToRgba(themeColor, 0.15)}`,
                        transition: 'all 0.2s ease',
                        cursor: 'default'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = hexToRgba(themeColor, 0.1);
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${hexToRgba(themeColor, 0.2)}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = hexToRgba(themeColor, 0.05);
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#9ca3af',
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {item.label}
                      </div>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: 'bold',
                        color: '#1a1f3a',
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem'
                      }}>
                        <span>{item.value}</span>
                        <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!weather && !loading && !error && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: `2px dashed ${hexToRgba(themeColor, 0.3)}`
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '1rem',
              color: themeColor,
              opacity: 0.4,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              ▒▒▒
            </div>
            <div style={{ 
              color: '#6b7280',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              AWAITING INPUT...
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        ::placeholder {
          color: #9ca3af;
          opacity: 0.6;
        }

        /* Responsive breakpoints */
        @media (max-width: 768px) {
          .weather-grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Smooth scrolling */
        * {
          scrollbar-width: thin;
          scrollbar-color: ${hexToRgba(themeColor, 0.3)} transparent;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: ${hexToRgba(themeColor, 0.3)};
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default WeatherApp;