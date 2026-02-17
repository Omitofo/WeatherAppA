//src/WeatherApp.jsx
import React, { useState, useEffect } from 'react';

// Enhanced design: 3-column desktop layout, animated weather icons, better contrast
// Layout: 2/4 main weather (left) | 1/4 metrics (top right) | 1/4 sun data (bottom right)

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

  // Determine wind animation class based on speed (m/s)
  const getWindClass = (speed) => {
    if (speed < 2) return 'wind-calm';       // 0-2 m/s: Calm
    if (speed < 5) return 'wind-light';      // 2-5 m/s: Light breeze
    if (speed < 10) return 'wind-moderate';  // 5-10 m/s: Moderate
    if (speed < 15) return 'wind-strong';    // 10-15 m/s: Strong
    return 'wind-gale';                      // 15+ m/s: Gale
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      Clear: (
        <div className="weather-icon-animated sun">
          <div className="sun-core">☀️</div>
          <div className="sun-rays"></div>
        </div>
      ),
      Clouds: (
        <div className="weather-icon-animated clouds">
          <span style={{ fontSize: '5rem' }}>☁️</span>
        </div>
      ),
      Rain: (
        <div className="weather-icon-animated rain">
          <div className="rain-cloud">☁️</div>
          <div className="rain-drops">
            <span>💧</span>
            <span>💧</span>
            <span>💧</span>
          </div>
        </div>
      ),
      Drizzle: (
        <div className="weather-icon-animated drizzle">
          <div className="drizzle-cloud">🌦️</div>
          <div className="drizzle-drops">
            <span>💧</span>
            <span>💧</span>
          </div>
        </div>
      ),
      Thunderstorm: (
        <div className="weather-icon-animated thunderstorm">
          <div className="storm-cloud">⛈️</div>
          <div className="lightning">⚡</div>
        </div>
      ),
      Snow: (
        <div className="weather-icon-animated snow">
          <div className="snow-cloud">☁️</div>
          <div className="snowflakes">
            <span>❄️</span>
            <span>❄️</span>
            <span>❄️</span>
          </div>
        </div>
      ),
      Mist: (
        <div className="weather-icon-animated mist">
          <span style={{ fontSize: '5rem' }}>🌫️</span>
        </div>
      ),
      Smoke: (
        <div className="weather-icon-animated smoke">
          <span style={{ fontSize: '5rem' }}>💨</span>
        </div>
      ),
      Haze: (
        <div className="weather-icon-animated haze">
          <span style={{ fontSize: '5rem' }}>🌫️</span>
        </div>
      ),
      Dust: (
        <div className="weather-icon-animated dust">
          <span style={{ fontSize: '5rem' }}>💨</span>
        </div>
      ),
      Fog: (
        <div className="weather-icon-animated fog">
          <span style={{ fontSize: '5rem' }}>🌫️</span>
        </div>
      ),
    };
    return iconMap[condition] || <span style={{ fontSize: '5rem' }}>🌡️</span>;
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
      width: '100%',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      fontFamily: '"Courier New", Courier, monospace',
      padding: '1.5rem',
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
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem',
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
                fontSize: '1.75rem',
                margin: 0,
                color: themeColor,
                textShadow: `0 0 20px ${hexToRgba(themeColor, 0.4)}`,
                letterSpacing: '0.1em',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
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
                      fontSize: '0.6rem',
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
                fontSize: '0.95rem',
                color: themeColor,
                fontWeight: 'bold',
                padding: '0.4rem 0.9rem',
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
          padding: '1.25rem 1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            fontSize: '0.85rem',
            marginBottom: '0.6rem',
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
                padding: '0.75rem 1.1rem',
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
                padding: '0.75rem 1.75rem',
                fontFamily: 'inherit',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1,
                boxShadow: `0 4px 12px ${hexToRgba(themeColor, 0.3)}`,
                minWidth: '130px'
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
            padding: '0.9rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            {'>'} ERROR: {error.toUpperCase()}
          </div>
        )}

        {/* Weather Display - 3 Column Layout */}
        {weather && (
          <div className="weather-layout" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr',
            gridTemplateRows: 'auto auto',
            gap: '1.5rem',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            {/* Main Weather Card - Spans 2 rows on left (2/4) */}
            <div style={{
              gridColumn: '1',
              gridRow: '1 / 3',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: `2px solid ${hexToRgba(themeColor, 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
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

              <div className="location-name" style={{
                fontSize: '1.5rem',
                color: '#1f2937',
                fontWeight: 'bold'
              }}>
                {weather.name.toUpperCase()}, {weather.sys.country}
              </div>

              <div className="temp-display-container" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginTop: '1rem',
                marginBottom: '1.5rem',
                alignItems: 'center'
              }}>
                {/* Temperature Display - First Column */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '4.5rem',
                    fontWeight: 'bold',
                    lineHeight: 1,
                    color: '#1a1f3a',
                    textShadow: `2px 2px 0 ${hexToRgba(themeColor, 0.1)}`
                  }}>
                    {Math.round(weather.main.temp)}°
                  </div>
                  <div style={{
                    fontSize: '1.2rem',
                    color: '#4b5563',
                    marginTop: '0.5rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {weather.weather[0].description}
                  </div>
                  
                  {/* Windsock - Mobile Version (shows below temp on mobile) */}
                  <div className="windsock-mobile" style={{
                    marginTop: '1rem',
                    display: 'none'
                  }}>
                    <div style={{
                      background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.1)}, ${hexToRgba(themeColor, 0.05)})`,
                      borderRadius: '12px',
                      padding: '1rem',
                      border: `2px solid ${hexToRgba(themeColor, 0.2)}`,
                      display: 'inline-block'
                    }}>
                      <div className={`windsock ${getWindClass(weather.wind.speed)}`}>
                        <div className="windsock-pole"></div>
                        <div className="windsock-cone"></div>
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '0.5rem',
                        fontWeight: '600'
                      }}>
                        WIND: {weather.wind.speed} m/s
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Weather Icon - Second Column */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.1)}, ${hexToRgba(themeColor, 0.05)})`,
                    borderRadius: '20px',
                    padding: '1.5rem',
                    border: `2px solid ${hexToRgba(themeColor, 0.2)}`,
                    boxShadow: `0 8px 24px ${hexToRgba(themeColor, 0.2)}`
                  }}>
                    {getWeatherIcon(weather.weather[0].main)}
                  </div>
                </div>

                {/* Windsock - Desktop Version - Third Column */}
                <div className="windsock-desktop" style={{
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: `linear-gradient(135deg, ${hexToRgba(themeColor, 0.1)}, ${hexToRgba(themeColor, 0.05)})`,
                    borderRadius: '20px',
                    padding: '1.5rem',
                    border: `2px solid ${hexToRgba(themeColor, 0.2)}`,
                    boxShadow: `0 8px 24px ${hexToRgba(themeColor, 0.2)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div className={`windsock ${getWindClass(weather.wind.speed)}`}>
                      <div className="windsock-pole"></div>
                      <div className="windsock-cone"></div>
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '600',
                      textAlign: 'center'
                    }}>
                      WIND<br/>{weather.wind.speed} m/s
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${hexToRgba(themeColor, 0.2)}`
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    FEELS LIKE
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                    {Math.round(weather.main.feels_like)}°C
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    HUMIDITY
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                    {weather.main.humidity}%
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Metrics - Top right (1/4) */}
            <div style={{
              gridColumn: '2 / 4',
              gridRow: '1',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: '#6b7280',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                {'>'} DETAILED METRICS
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '1rem'
              }}>
                {[
                  { label: 'PRESSURE', value: `${weather.main.pressure}`, unit: 'hPa' },
                  { label: 'WIND', value: `${weather.wind.speed}`, unit: 'm/s' },
                  { label: 'MIN', value: `${Math.round(weather.main.temp_min)}`, unit: '°C' },
                  { label: 'MAX', value: `${Math.round(weather.main.temp_max)}`, unit: '°C' },
                  { label: 'VISIBILITY', value: `${(weather.visibility / 1000).toFixed(1)}`, unit: 'km' },
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
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
                      marginBottom: '0.4rem',
                      fontWeight: '600'
                    }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '1.4rem',
                      fontWeight: 'bold',
                      color: '#1a1f3a',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.2rem'
                    }}>
                      <span>{item.value}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sun Data - Bottom right (1/4) */}
            <div style={{
              gridColumn: '2 / 4',
              gridRow: '2',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '1.25rem',
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
                <div style={{
                  padding: '1rem',
                  background: hexToRgba(themeColor, 0.05),
                  borderRadius: '8px',
                  border: `1px solid ${hexToRgba(themeColor, 0.15)}`
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                    SUNRISE
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                    {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  background: hexToRgba(themeColor, 0.05),
                  borderRadius: '8px',
                  border: `1px solid ${hexToRgba(themeColor, 0.15)}`
                }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem' }}>
                    SUNSET
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                    {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
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
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: `2px dashed ${hexToRgba(themeColor, 0.3)}`
          }}>
            <div style={{ 
              fontSize: '3.5rem', 
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
        /* Animated Weather Icons */
        .weather-icon-animated {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 140px;
          height: 140px;
        }

        /* Sun Animation */
        .sun {
          position: relative;
        }
        .sun-core {
          font-size: 5rem;
          animation: sunPulse 3s ease-in-out infinite;
        }
        .sun-rays {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: sunRotate 20s linear infinite;
        }
        .sun-rays::before {
          content: '✨';
          position: absolute;
          font-size: 2rem;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
        }
        .sun-rays::after {
          content: '✨';
          position: absolute;
          font-size: 2rem;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Rain Animation */
        .rain {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .rain-cloud {
          font-size: 4.5rem;
          margin-bottom: -15px;
          z-index: 2;
        }
        .rain-drops {
          display: flex;
          gap: 15px;
          animation: rainFall 1s ease-in-out infinite;
        }
        .rain-drops span {
          font-size: 1.5rem;
          animation: dropFall 1s ease-in-out infinite;
        }
        .rain-drops span:nth-child(2) {
          animation-delay: 0.3s;
        }
        .rain-drops span:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes rainFall {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(10px); opacity: 0.7; }
        }

        @keyframes dropFall {
          0% { transform: translateY(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }

        /* Drizzle Animation */
        .drizzle {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .drizzle-cloud {
          font-size: 5rem;
          margin-bottom: -10px;
        }
        .drizzle-drops {
          display: flex;
          gap: 20px;
          animation: drizzleFall 1.5s ease-in-out infinite;
        }
        .drizzle-drops span {
          font-size: 1.2rem;
          animation: dropFall 1.5s ease-in-out infinite;
        }
        .drizzle-drops span:nth-child(2) {
          animation-delay: 0.5s;
        }

        @keyframes drizzleFall {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        /* Thunderstorm Animation */
        .thunderstorm {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .storm-cloud {
          font-size: 5rem;
          animation: stormShake 0.5s ease-in-out infinite;
        }
        .lightning {
          font-size: 2rem;
          margin-top: -15px;
          animation: lightningFlash 2s ease-in-out infinite;
        }

        @keyframes stormShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }

        @keyframes lightningFlash {
          0%, 90%, 100% { opacity: 0; }
          92%, 94% { opacity: 1; }
        }

        /* Snow Animation */
        .snow {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .snow-cloud {
          font-size: 4.5rem;
          margin-bottom: -10px;
        }
        .snowflakes {
          display: flex;
          gap: 12px;
        }
        .snowflakes span {
          font-size: 1.5rem;
          animation: snowFall 3s ease-in-out infinite;
        }
        .snowflakes span:nth-child(1) {
          animation-delay: 0s;
        }
        .snowflakes span:nth-child(2) {
          animation-delay: 1s;
        }
        .snowflakes span:nth-child(3) {
          animation-delay: 2s;
        }

        @keyframes snowFall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(30px) rotate(360deg); opacity: 0; }
        }

        /* Clouds Animation */
        .clouds span {
          animation: cloudFloat 4s ease-in-out infinite;
        }

        @keyframes cloudFloat {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }

        /* Mist/Fog Animation */
        .mist span, .fog span {
          animation: mistFloat 3s ease-in-out infinite;
        }

        @keyframes mistFloat {
          0%, 100% { opacity: 0.6; transform: translateX(0); }
          50% { opacity: 0.9; transform: translateX(5px); }
        }

        /* Smoke/Dust Animation */
        .smoke span, .dust span {
          animation: smokeDrift 2s ease-in-out infinite;
        }

        @keyframes smokeDrift {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
          50% { transform: translateX(8px) scale(1.1); opacity: 1; }
        }

        /* Windsock Styles */
        .windsock {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .windsock-pole {
          position: absolute;
          left: 15px;
          bottom: 10px;
          width: 3px;
          height: 50px;
          background: linear-gradient(180deg, #4b5563 0%, #6b7280 100%);
          border-radius: 2px;
        }

        .windsock-pole::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -3px;
          width: 9px;
          height: 9px;
          background: #374151;
          border-radius: 50%;
        }

        .windsock-cone {
          position: absolute;
          left: 18px;
          top: 15px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-left: 45px solid ${themeColor};
          transform-origin: left center;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2));
        }

        /* Wind Speed Animations */
        /* Calm: 0-2 m/s - Hangs down-left at 240 degrees (bottom-left, droopy) */
        .wind-calm .windsock-cone {
          border-left-width: 25px;
          opacity: 0.5;
          animation: windCalm 4s ease-in-out infinite;
        }

        /* Light: 2-5 m/s - Down-left at 210 degrees (lifting slightly) */
        .wind-light .windsock-cone {
          border-left-width: 30px;
          opacity: 0.65;
          animation: windLight 2.5s ease-in-out infinite;
        }

        /* Moderate: 5-10 m/s - Slightly below horizontal left at 190 degrees */
        .wind-moderate .windsock-cone {
          border-left-width: 38px;
          opacity: 0.8;
          animation: windModerate 1.8s ease-in-out infinite;
        }

        /* Strong: 10-15 m/s - Horizontal to the left at 180 degrees */
        .wind-strong .windsock-cone {
          border-left-width: 45px;
          opacity: 0.95;
          animation: windStrong 1.2s ease-in-out infinite;
        }

        /* Gale: 15+ m/s - Horizontal to the left at 180 degrees with violent movement */
        .wind-gale .windsock-cone {
          border-left-width: 50px;
          opacity: 1;
          animation: windGale 0.5s ease-in-out infinite;
        }

        @keyframes windCalm {
          0%, 100% { transform: rotate(-60deg) scaleX(0.8); }
          50% { transform: rotate(-56deg) scaleX(0.85); }
        }

        @keyframes windLight {
          0%, 100% { transform: rotate(-30deg) scaleX(0.9); }
          50% { transform: rotate(-26deg) scaleX(0.95); }
        }

        @keyframes windModerate {
          0%, 100% { transform: rotate(-10deg) scaleX(1); }
          50% { transform: rotate(-6deg) scaleX(1.05); }
        }

        @keyframes windStrong {
          0%, 100% { transform: rotate(2deg) scaleX(1.08); }
          25% { transform: rotate(-2deg) scaleX(1.12); }
          50% { transform: rotate(2deg) scaleX(1.08); }
          75% { transform: rotate(-2deg) scaleX(1.12); }
        }

        @keyframes windGale {
          0% { transform: rotate(0deg) scaleX(1.15); }
          20% { transform: rotate(-5deg) scaleX(1.2); }
          40% { transform: rotate(5deg) scaleX(1.18); }
          60% { transform: rotate(-3deg) scaleX(1.2); }
          80% { transform: rotate(3deg) scaleX(1.18); }
          100% { transform: rotate(0deg) scaleX(1.15); }
        }

        /* General Animations */
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

        /* Responsive Layout */
        @media (max-width: 1200px) {
          .weather-layout {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto auto auto !important;
          }
          .weather-layout > div:first-child {
            grid-column: 1 / 3 !important;
            grid-row: 1 !important;
          }
          .weather-layout > div:nth-child(2) {
            grid-column: 1 / 3 !important;
            grid-row: 2 !important;
          }
          .weather-layout > div:nth-child(3) {
            grid-column: 1 / 3 !important;
            grid-row: 3 !important;
          }
        }

        @media (max-width: 768px) {
          .weather-layout {
            grid-template-columns: 1fr !important;
          }
          .weather-layout > div {
            grid-column: 1 !important;
          }
          h1 {
            font-size: 1.4rem !important;
          }
          
          /* Center location name on mobile */
          .location-name {
            text-align: center !important;
          }
          
          /* Switch to single column layout on mobile */
          .temp-display-container {
            grid-template-columns: 1fr !important;
          }
          
          /* Hide desktop windsock, show mobile version */
          .windsock-desktop {
            display: none !important;
          }
          .windsock-mobile {
            display: block !important;
          }
          
          /* Reduce temperature font size on mobile */
          .temp-display-container > div:nth-child(1) > div:first-child {
            font-size: 3.5rem !important;
          }
          .temp-display-container > div:nth-child(1) > div:nth-child(2) {
            font-size: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          h1 {
            font-size: 1.2rem !important;
          }
          .weather-icon-animated {
            width: 100px !important;
            height: 100px !important;
          }
          .sun-core, .rain-cloud, .drizzle-cloud, .storm-cloud, .clouds span {
            font-size: 3.5rem !important;
          }
          
          /* Further reduce temperature on small mobile */
          .temp-display-container > div:nth-child(1) > div:first-child {
            font-size: 3rem !important;
          }
          .temp-display-container > div:nth-child(1) > div:nth-child(2) {
            font-size: 0.9rem !important;
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