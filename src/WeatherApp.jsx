import React, { useState, useEffect } from 'react';

// Aesthetic Direction: Retro-Futuristic Terminal with Color Customization
// Think 1980s sci-fi computer interfaces meets modern minimalism
// Monospace fonts, customizable neon accents, scanline effects, ASCII-inspired graphics

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [themeColor, setThemeColor] = useState('#00ff41'); // Default: neon green

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
      // Using Vercel serverless function to keep API key secure
      const response = await fetch(`/api/weather?city=${encodeURIComponent(location)}`);
      
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

  // Helper function to create rgba from hex
  const hexToRgba = (hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      fontFamily: '"Courier New", Courier, monospace',
      color: themeColor,
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Scanline effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `repeating-linear-gradient(0deg, ${hexToRgba(themeColor, 0.03)} 0px, ${hexToRgba(themeColor, 0.03)} 1px, transparent 1px, transparent 2px)`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Noise texture */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        opacity: 0.4,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Header */}
        <div style={{
          borderBottom: `2px solid ${themeColor}`,
          paddingBottom: '1rem',
          marginBottom: '2rem',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h1 style={{
                fontSize: '2rem',
                margin: 0,
                textShadow: `0 0 10px ${themeColor}, 0 0 20px ${themeColor}`,
                letterSpacing: '0.2em'
              }}>
                WEATHER.SYS
              </h1>
              <div style={{
                fontSize: '0.75rem',
                color: themeColor,
                opacity: 0.5,
                marginTop: '0.5rem'
              }}>
                {'>'} METEOROLOGICAL DATA TERMINAL v2.024
              </div>
            </div>

            {/* Color Theme Selector */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'flex-end'
            }}>
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.6
              }}>
                {'>'} COLOR MODE:
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                justifyContent: 'flex-end'
              }}>
                {colorThemes.map((theme) => (
                  <button
                    key={theme.color}
                    onClick={() => setThemeColor(theme.color)}
                    title={theme.name}
                    style={{
                      width: '40px',
                      height: '40px',
                      border: themeColor === theme.color 
                        ? `2px solid ${theme.color}` 
                        : `1px solid ${hexToRgba(theme.color, 0.3)}`,
                      background: themeColor === theme.color 
                        ? hexToRgba(theme.color, 0.15)
                        : hexToRgba(theme.color, 0.05),
                      color: theme.color,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      boxShadow: themeColor === theme.color 
                        ? `0 0 15px ${hexToRgba(theme.color, 0.4)}` 
                        : 'none',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = hexToRgba(theme.color, 0.2);
                      e.target.style.boxShadow = `0 0 15px ${hexToRgba(theme.color, 0.4)}`;
                    }}
                    onMouseLeave={(e) => {
                      if (themeColor !== theme.color) {
                        e.target.style.background = hexToRgba(theme.color, 0.05);
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: themeColor,
                opacity: 0.7
              }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div style={{
          marginBottom: '2rem',
          animation: 'fadeIn 1s ease-out 0.2s both'
        }}>
          <div style={{
            fontSize: '0.85rem',
            marginBottom: '0.5rem',
            color: themeColor,
            opacity: 0.7
          }}>
            {'>'} ENTER LOCATION:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="City name..."
              style={{
                flex: 1,
                background: hexToRgba(themeColor, 0.05),
                border: `1px solid ${themeColor}`,
                color: themeColor,
                padding: '0.75rem 1rem',
                fontFamily: 'inherit',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: `inset 0 0 10px ${hexToRgba(themeColor, 0.1)}`,
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `inset 0 0 20px ${hexToRgba(themeColor, 0.2)}, 0 0 10px ${hexToRgba(themeColor, 0.3)}`;
                e.target.style.background = hexToRgba(themeColor, 0.08);
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = `inset 0 0 10px ${hexToRgba(themeColor, 0.1)}`;
                e.target.style.background = hexToRgba(themeColor, 0.05);
              }}
            />
            <button
              onClick={searchWeather}
              disabled={loading}
              style={{
                background: hexToRgba(themeColor, 0.1),
                border: `1px solid ${themeColor}`,
                color: themeColor,
                padding: '0.75rem 1.5rem',
                fontFamily: 'inherit',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                textShadow: `0 0 5px ${themeColor}`,
                transition: 'all 0.3s ease',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = hexToRgba(themeColor, 0.2);
                  e.target.style.boxShadow = `0 0 20px ${hexToRgba(themeColor, 0.4)}`;
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = hexToRgba(themeColor, 0.1);
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? 'SCANNING...' : 'EXECUTE'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid #ff0000',
            color: '#ff0000',
            padding: '1rem',
            marginBottom: '2rem',
            animation: 'shake 0.5s ease-out'
          }}>
            {'>'} ERROR: {error.toUpperCase()}
          </div>
        )}

        {/* Weather Display */}
        {weather && (
          <div style={{
            animation: 'slideUp 0.6s ease-out'
          }}>
            {/* Main Weather Info */}
            <div style={{
              border: `2px solid ${themeColor}`,
              padding: '2rem',
              marginBottom: '1rem',
              background: hexToRgba(themeColor, 0.02),
              boxShadow: `0 0 30px ${hexToRgba(themeColor, 0.1)}`,
              position: 'relative'
            }}>
              {/* Corner accents */}
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                width: '20px',
                height: '20px',
                borderTop: `4px solid ${themeColor}`,
                borderLeft: `4px solid ${themeColor}`
              }} />
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '20px',
                height: '20px',
                borderTop: `4px solid ${themeColor}`,
                borderRight: `4px solid ${themeColor}`
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '-2px',
                width: '20px',
                height: '20px',
                borderBottom: `4px solid ${themeColor}`,
                borderLeft: `4px solid ${themeColor}`
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '20px',
                height: '20px',
                borderBottom: `4px solid ${themeColor}`,
                borderRight: `4px solid ${themeColor}`
              }} />

              <div style={{
                fontSize: '0.85rem',
                opacity: 0.7,
                marginBottom: '1rem'
              }}>
                LOCATION: {weather.name.toUpperCase()}, {weather.sys.country}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '2rem',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '5rem',
                  textAlign: 'center',
                  filter: `drop-shadow(0 0 10px ${themeColor})`
                }}>
                  {getWeatherIcon(weather.weather[0].main)}
                </div>

                <div>
                  <div style={{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    textShadow: `0 0 20px ${themeColor}`,
                    marginBottom: '0.5rem'
                  }}>
                    {Math.round(weather.main.temp)}°C
                  </div>
                  <div style={{
                    fontSize: '1.2rem',
                    opacity: 0.8,
                    textTransform: 'uppercase'
                  }}>
                    {weather.weather[0].description}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { label: 'FEELS LIKE', value: `${Math.round(weather.main.feels_like)}°C` },
                { label: 'HUMIDITY', value: `${weather.main.humidity}%` },
                { label: 'PRESSURE', value: `${weather.main.pressure} hPa` },
                { label: 'WIND SPEED', value: `${weather.wind.speed} m/s` },
                { label: 'MIN TEMP', value: `${Math.round(weather.main.temp_min)}°C` },
                { label: 'MAX TEMP', value: `${Math.round(weather.main.temp_max)}°C` },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    border: `1px solid ${themeColor}`,
                    padding: '1rem',
                    background: hexToRgba(themeColor, 0.02),
                    animation: `fadeIn 0.5s ease-out ${0.1 * index}s both`
                  }}
                >
                  <div style={{
                    fontSize: '0.7rem',
                    opacity: 0.6,
                    marginBottom: '0.5rem'
                  }}>
                    {'>'} {item.label}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              border: `1px solid ${hexToRgba(themeColor, 0.3)}`,
              background: hexToRgba(themeColor, 0.01),
              fontSize: '0.75rem',
              opacity: 0.6
            }}>
              <div>SUNRISE: {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}</div>
              <div>SUNSET: {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}</div>
              <div>VISIBILITY: {(weather.visibility / 1000).toFixed(1)} km</div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!weather && !loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            opacity: 0.4,
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>▒▒▒</div>
            <div>AWAITING INPUT...</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
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
          50% { opacity: 0.5; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        ::placeholder {
          color: ${hexToRgba(themeColor, 0.3)};
        }
      `}</style>
    </div>
  );
};

export default WeatherApp;