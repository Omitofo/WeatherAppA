// src/WeatherApp.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const WeatherApp = () => {
  const [weather, setWeather]           = useState(null);
  const [location, setLocation]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [currentTime, setCurrentTime]   = useState(new Date());
  const [themeColor, setThemeColor]     = useState('#00ff41');
  const [activeBaseLayer, setActiveBaseLayer]   = useState('CartoDB Light');
  const [activeOverlays, setActiveOverlays]     = useState([]);

  // FIX: Hold a ref to the marker so we can update its icon without
  // tearing down and rebuilding the entire Leaflet map on theme changes.
  const markerRef = useRef(null);

  const BASE_LAYERS = [
    { id: 'CartoDB Light', label: 'Light' },
    { id: 'CartoDB Dark',  label: 'Dark' },
    { id: 'OpenStreetMap', label: 'Streets' },
    { id: 'Satellite',     label: '🛰 Sat' },
    { id: 'Topo',          label: '🗺 Topo' },
  ];

  const OVERLAY_LAYERS = [
    { id: 'Precipitation', label: '🌧 Rain' },
    { id: 'Clouds',        label: '☁️ Clouds' },
    { id: 'Wind',          label: '💨 Wind' },
    { id: 'Temperature',   label: '🌡 Temp' },
  ];

  const colorThemes = [
    { name: 'NEON',   color: '#00ff41', label: 'GRN' },
    { name: 'CYAN',   color: '#00d9ff', label: 'CYN' },
    { name: 'PINK',   color: '#ff006e', label: 'PNK' },
    { name: 'AMBER',  color: '#ffbe0b', label: 'AMB' },
    { name: 'ORANGE', color: '#fb5607', label: 'ORG' },
  ];

  // FIX: Memoize hexToRgba so repeated calls during render are cheap.
  // The function itself is pure — only recreate when themeColor changes.
  const hexToRgba = useCallback((hex, alpha) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Pre-compute the most-used rgba variants so they're not recalculated per element
  const themeRgba = useMemo(() => ({
    a02:  hexToRgba(themeColor, 0.02),
    a05:  hexToRgba(themeColor, 0.05),
    a10:  hexToRgba(themeColor, 0.1),
    a12:  hexToRgba(themeColor, 0.12),
    a15:  hexToRgba(themeColor, 0.15),
    a20:  hexToRgba(themeColor, 0.2),
    a25:  hexToRgba(themeColor, 0.25),
    a30:  hexToRgba(themeColor, 0.3),
    a35:  hexToRgba(themeColor, 0.35),
    a40:  hexToRgba(themeColor, 0.4),
    a50:  hexToRgba(themeColor, 0.5),
  }), [themeColor, hexToRgba]);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Base layer swap ──────────────────────────────────────────────────────
  useEffect(() => {
    const mapContainer = document.getElementById('weather-map');
    const map = mapContainer?._leafletMap;
    if (!map || !map._baseLayers) return;

    Object.entries(map._baseLayers).forEach(([id, layer]) => {
      if (id === activeBaseLayer) { if (!map.hasLayer(layer)) map.addLayer(layer); }
      else                        { if (map.hasLayer(layer))  map.removeLayer(layer); }
    });

    // Re-stamp active overlays on top of the new base to preserve z-order
    if (map._overlayLayers) {
      Object.entries(map._overlayLayers).forEach(([id, layer]) => {
        if (activeOverlays.includes(id)) {
          map.removeLayer(layer);
          map.addLayer(layer);
        }
      });
    }
  }, [activeBaseLayer]);

  // ── Overlay toggle ───────────────────────────────────────────────────────
  useEffect(() => {
    const mapContainer = document.getElementById('weather-map');
    const map = mapContainer?._leafletMap;
    if (!map || !map._overlayLayers) return;

    Object.entries(map._overlayLayers).forEach(([id, layer]) => {
      if (activeOverlays.includes(id)) { if (!map.hasLayer(layer)) map.addLayer(layer); }
      else                             { if (map.hasLayer(layer))  map.removeLayer(layer); }
    });
  }, [activeOverlays]);

  // FIX: Update only the marker icon when themeColor changes —
  // no need to destroy/recreate the entire map.
  useEffect(() => {
    if (!markerRef.current || !window.L) return;
    markerRef.current.setIcon(
      window.L.divIcon({
        className: '',
        html: markerHtml(themeColor),
        iconSize:    [18, 18],
        iconAnchor:  [9, 9],
        popupAnchor: [0, -12],
      })
    );
  }, [themeColor]);

  // ── Map init (runs only when weather data changes) ───────────────────────
  useEffect(() => {
    if (!weather) return;

    const initMap = () => {
      const mapContainer = document.getElementById('weather-map');
      if (!mapContainer || !window.L) return;

      if (mapContainer._leafletMap) {
        mapContainer._leafletMap.remove();
        delete mapContainer._leafletMap;
        markerRef.current = null;
      }

      const lat = weather.coord?.lat || 0;
      const lon = weather.coord?.lon || 0;

      const map = window.L.map(mapContainer, {
        zoomControl: true,
        attributionControl: true,
      }).setView([lat, lon], 4);

      // ── Base Layers ──────────────────────────────────────────────────────
      const baseLayers = {
        'CartoDB Light': window.L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }
        ),
        'CartoDB Dark': window.L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }
        ),
        'OpenStreetMap': window.L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '© OpenStreetMap contributors', maxZoom: 19 }
        ),
        'Satellite': window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: '© Esri, Maxar, Earthstar Geographics', maxZoom: 19 }
        ),
        'Topo': window.L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
          { attribution: '© Esri, HERE, © OpenStreetMap contributors', maxZoom: 19 }
        ),
      };

      baseLayers[activeBaseLayer]?.addTo(map);
      map._baseLayers = baseLayers;

      // ── Weather Overlays ─────────────────────────────────────────────────
      // Opacity tuned per-layer: precipitation/wind are already vivid at 0.85,
      // clouds need a boost to 0.9 to show clearly over light base maps,
      // temperature is the most colourful layer so 0.85 keeps it readable.
      const overlayLayers = {
        'Precipitation': window.L.tileLayer(
          '/api/tiles?layer=precipitation_new&z={z}&x={x}&y={y}',
          { attribution: '© OpenWeatherMap', maxZoom: 19, opacity: 0.95 }
        ),
        'Clouds': window.L.tileLayer(
          '/api/tiles?layer=clouds_new&z={z}&x={x}&y={y}',
          { attribution: '© OpenWeatherMap', maxZoom: 19, opacity: 0.95 }
        ),
        'Wind': window.L.tileLayer(
          '/api/tiles?layer=wind_new&z={z}&x={x}&y={y}',
          { attribution: '© OpenWeatherMap', maxZoom: 19, opacity: 0.95 }
        ),
        'Temperature': window.L.tileLayer(
          '/api/tiles?layer=temp_new&z={z}&x={x}&y={y}',
          { attribution: '© OpenWeatherMap', maxZoom: 19, opacity: 0.95 }
        ),
      };

      activeOverlays.forEach(id => overlayLayers[id]?.addTo(map));
      map._overlayLayers = overlayLayers;

      // ── Marker ───────────────────────────────────────────────────────────
      const marker = window.L.marker([lat, lon], {
        icon: window.L.divIcon({
          className: '',
          html: markerHtml(themeColor),
          iconSize:    [18, 18],
          iconAnchor:  [9, 9],
          popupAnchor: [0, -12],
        }),
      }).addTo(map)
        .bindPopup(`
          <div style="font-family:'Courier New',monospace; padding:6px; font-size:0.85rem;">
            <strong>${weather.name}, ${weather.sys.country}</strong><br/>
            ${Math.round(weather.main.temp)}°C — ${weather.weather[0].description}
          </div>
        `)
        .openPopup();

      markerRef.current = marker;

      setTimeout(() => map.invalidateSize(), 50);
      mapContainer._leafletMap = map;
    };

    if (window.L) {
      setTimeout(initMap, 100);
    } else {
      const existingScript = document.querySelector('script[src*="leaflet"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setTimeout(initMap, 100));
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => setTimeout(initMap, 100);
        document.head.appendChild(script);
      }
    }

    return () => {
      const mapContainer = document.getElementById('weather-map');
      if (mapContainer?._leafletMap) {
        mapContainer._leafletMap.remove();
        delete mapContainer._leafletMap;
        markerRef.current = null;
      }
    };
  // FIX: Removed themeColor from deps — theme changes are handled by the
  // dedicated marker-icon effect above, not by full map reinitialisation.
  }, [weather]);

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

  // FIX: Replaced deprecated onKeyPress with onKeyDown
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchWeather();
  };

  const getWindClass = (speed) => {
    if (speed < 2)  return 'wind-calm';
    if (speed < 5)  return 'wind-light';
    if (speed < 10) return 'wind-moderate';
    if (speed < 15) return 'wind-strong';
    return 'wind-gale';
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
          <div className="rain-drops"><span>💧</span><span>💧</span><span>💧</span></div>
        </div>
      ),
      Drizzle: (
        <div className="weather-icon-animated drizzle">
          <div className="drizzle-cloud">🌦️</div>
          <div className="drizzle-drops"><span>💧</span><span>💧</span></div>
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
          <div className="snowflakes"><span>❄️</span><span>❄️</span><span>❄️</span></div>
        </div>
      ),
      Mist:  <div className="weather-icon-animated mist"><span style={{ fontSize: '5rem' }}>🌫️</span></div>,
      Smoke: <div className="weather-icon-animated smoke"><span style={{ fontSize: '5rem' }}>💨</span></div>,
      Haze:  <div className="weather-icon-animated haze"><span style={{ fontSize: '5rem' }}>🌫️</span></div>,
      Dust:  <div className="weather-icon-animated dust"><span style={{ fontSize: '5rem' }}>💨</span></div>,
      Fog:   <div className="weather-icon-animated fog"><span style={{ fontSize: '5rem' }}>🌫️</span></div>,
    };
    return iconMap[condition] || <span style={{ fontSize: '5rem' }}>🌡️</span>;
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      fontFamily: '"Courier New", Courier, monospace',
      padding: '1.5rem',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.02\'/%3E%3C/svg%3E")',
        opacity: 0.3, pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', position: 'relative' }}>

        {/* Header */}
        <div style={{
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
          borderRadius: '12px', padding: '1.25rem 1.75rem', marginBottom: '1.5rem',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', margin: 0, color: themeColor, textShadow: `0 0 20px ${themeRgba.a40}`, letterSpacing: '0.1em', fontWeight: 'bold', transition: 'all 0.3s ease' }}>
                WEATHER.SYS
              </h1>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {'>'} Meteorological Data Terminal v2.024
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {colorThemes.map((theme) => (
                  <button key={theme.color} onClick={() => setThemeColor(theme.color)} title={theme.name}
                    style={{
                      width: '36px', height: '36px',
                      border: themeColor === theme.color ? `2px solid ${theme.color}` : '2px solid transparent',
                      background: theme.color, cursor: 'pointer', borderRadius: '6px',
                      fontSize: '0.6rem', fontWeight: 'bold', color: 'white',
                      transition: 'all 0.2s ease',
                      boxShadow: themeColor === theme.color ? `0 0 16px ${hexToRgba(theme.color, 0.5)}` : '0 2px 4px rgba(0,0,0,0.1)',
                      transform: themeColor === theme.color ? 'scale(1.1)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 16px ${hexToRgba(theme.color, 0.5)}`; }}
                    onMouseLeave={(e) => { if (themeColor !== theme.color) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; } }}
                  >{theme.label}</button>
                ))}
              </div>
              <div style={{ fontSize: '0.95rem', color: themeColor, fontWeight: 'bold', padding: '0.4rem 0.9rem', background: themeRgba.a10, borderRadius: '6px', border: `1px solid ${themeRgba.a30}` }}>
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '1.25rem 1.75rem', marginBottom: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '0.6rem', color: '#4b5563', fontWeight: '600' }}>{'>'} ENTER LOCATION:</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="City name..."
              style={{ flex: '1 1 300px', background: 'white', border: `2px solid ${themeRgba.a30}`, color: '#1a1f3a', padding: '0.75rem 1.1rem', fontFamily: 'inherit', fontSize: '1rem', outline: 'none', borderRadius: '8px', transition: 'all 0.3s ease' }}
              onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.boxShadow = `0 0 0 3px ${themeRgba.a10}`; }}
              onBlur={(e)  => { e.target.style.borderColor = themeRgba.a30; e.target.style.boxShadow = 'none'; }}
            />
            <button
              onClick={searchWeather}
              disabled={loading}
              className="search-btn"
              style={{ background: themeColor, border: 'none', color: 'white', padding: '0.75rem 1.75rem', fontFamily: 'inherit', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '8px', transition: 'all 0.2s ease', opacity: loading ? 0.6 : 1, boxShadow: `0 4px 12px ${themeRgba.a30}`, minWidth: '130px' }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 16px ${themeRgba.a40}`; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 12px ${themeRgba.a30}`; }}
            >{loading ? 'SCANNING...' : 'EXECUTE'}</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', color: '#dc2626', padding: '0.9rem 1.25rem', marginBottom: '1.5rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem' }}>
            {'>'} ERROR: {error.toUpperCase()}
          </div>
        )}

        {/* Weather Display */}
        {weather && (
          <div className="weather-layout" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: 'auto auto', gap: '1.25rem', animation: 'fadeIn 0.5s ease-out' }}>

            {/* Main Weather Card */}
            <div style={{ gridColumn: '1', gridRow: '1 / 3', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `2px solid ${themeRgba.a20}`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${themeColor}, ${themeRgba.a50})` }} />
              <div className="location-name" style={{ fontSize: '1.5rem', color: '#1f2937', fontWeight: 'bold' }}>
                {weather.name.toUpperCase()}, {weather.sys.country}
              </div>
              <div className="temp-display-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4.5rem', fontWeight: 'bold', lineHeight: 1, color: '#1a1f3a', textShadow: `2px 2px 0 ${themeRgba.a10}` }}>{Math.round(weather.main.temp)}°</div>
                  <div style={{ fontSize: '1.2rem', color: '#4b5563', marginTop: '0.5rem', textTransform: 'uppercase', fontWeight: '600' }}>{weather.weather[0].description}</div>
                  <div className="windsock-mobile" style={{ marginTop: '1rem', display: 'none' }}>
                    <div style={{ background: `linear-gradient(135deg, ${themeRgba.a10}, ${themeRgba.a05})`, borderRadius: '12px', padding: '1rem', border: `2px solid ${themeRgba.a20}`, display: 'inline-block' }}>
                      <div className={`windsock ${getWindClass(weather.wind.speed)}`}><div className="windsock-pole"></div><div className="windsock-cone"></div></div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontWeight: '600' }}>WIND: {weather.wind.speed} m/s</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: `linear-gradient(135deg, ${themeRgba.a10}, ${themeRgba.a05})`, borderRadius: '20px', padding: '1.25rem', border: `2px solid ${themeRgba.a20}`, boxShadow: `0 8px 24px ${themeRgba.a20}` }}>
                    {getWeatherIcon(weather.weather[0].main)}
                  </div>
                </div>
                <div className="windsock-desktop" style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: `linear-gradient(135deg, ${themeRgba.a10}, ${themeRgba.a05})`, borderRadius: '20px', padding: '1.25rem', border: `2px solid ${themeRgba.a20}`, boxShadow: `0 8px 24px ${themeRgba.a20}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={`windsock ${getWindClass(weather.wind.speed)}`}><div className="windsock-pole"></div><div className="windsock-cone"></div></div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textAlign: 'center' }}>WIND<br/>{weather.wind.speed} m/s</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${themeRgba.a20}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>FEELS LIKE</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1f3a' }}>{Math.round(weather.main.feels_like)}°C</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>HUMIDITY</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1f3a' }}>{weather.main.humidity}%</div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ gridColumn: '2 / 4', gridRow: '1', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', fontWeight: '600' }}>{'>'} DETAILED METRICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'PRESSURE',   value: `${weather.main.pressure}`,               unit: 'hPa' },
                  { label: 'WIND',       value: `${weather.wind.speed}`,                  unit: 'm/s' },
                  { label: 'MIN',        value: `${Math.round(weather.main.temp_min)}`,    unit: '°C' },
                  { label: 'MAX',        value: `${Math.round(weather.main.temp_max)}`,    unit: '°C' },
                  { label: 'VISIBILITY', value: `${((weather.visibility ?? 0) / 1000).toFixed(1)}`, unit: 'km' },
                ].map((item, index) => (
                  <div key={index}
                    style={{ padding: '1rem', background: themeRgba.a05, borderRadius: '8px', border: `1px solid ${themeRgba.a15}`, transition: 'all 0.2s ease', cursor: 'default' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = themeRgba.a10; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 12px ${themeRgba.a20}`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = themeRgba.a05; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem', fontWeight: '600' }}>{item.label}</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1a1f3a', display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                      <span>{item.value}</span><span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sun Data */}
            <div style={{ gridColumn: '2 / 4', gridRow: '2', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', fontWeight: '600' }}>{'>'} SUN DATA</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {['sunrise', 'sunset'].map((key) => (
                  <div key={key} style={{ padding: '1rem', background: themeRgba.a05, borderRadius: '8px', border: `1px solid ${themeRgba.a15}` }}>
                    <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.4rem' }}>{key.toUpperCase()}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1a1f3a' }}>
                      {(() => {
                        try {
                          const date = new Date(weather.sys[key] * 1000);
                          const offsetMinutes = (weather.timezone || 0) / 60;
                          const totalMinutes  = date.getUTCHours() * 60 + date.getUTCMinutes() + offsetMinutes;
                          let hours   = Math.floor(totalMinutes / 60) % 24;
                          const mins  = totalMinutes % 60;
                          const ampm  = hours >= 12 ? 'PM' : 'AM';
                          hours = hours % 12 || 12;
                          return `${hours}:${Math.abs(mins).toString().padStart(2, '0')} ${ampm}`;
                        } catch { return '--:--'; }
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div style={{ gridColumn: '1 / 4', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `2px solid ${themeRgba.a20}`, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem', fontWeight: '600' }}>{'>'} LOCATION MAP</div>

              <div id="weather-map" style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${themeRgba.a20}`, position: 'relative' }}>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <div style={{ width: '100%', height: '100%', background: '#f8f9fa' }} />
              </div>

              {/* Layer controls */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '700', letterSpacing: '0.05em', minWidth: '50px' }}>MAP</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {BASE_LAYERS.map(({ id, label }) => {
                      const isActive = activeBaseLayer === id;
                      return (
                        <button key={id} onClick={() => setActiveBaseLayer(id)} style={{
                          padding: '0.3rem 0.75rem', borderRadius: '999px',
                          border: `1.5px solid ${isActive ? themeColor : themeRgba.a25}`,
                          background: isActive ? themeColor : 'transparent',
                          color: isActive ? 'white' : '#4b5563',
                          fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                          boxShadow: isActive ? `0 2px 8px ${themeRgba.a35}` : 'none',
                        }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: '700', letterSpacing: '0.05em', minWidth: '50px' }}>LAYERS</span>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {OVERLAY_LAYERS.map(({ id, label }) => {
                      const isOn = activeOverlays.includes(id);
                      return (
                        <button key={id} onClick={() => setActiveOverlays(prev => isOn ? prev.filter(x => x !== id) : [...prev, id])} style={{
                          padding: '0.3rem 0.75rem', borderRadius: '999px',
                          border: `1.5px solid ${isOn ? themeColor : themeRgba.a25}`,
                          background: isOn ? themeRgba.a12 : 'transparent',
                          color: isOn ? themeColor : '#4b5563',
                          fontSize: '0.75rem', fontFamily: 'inherit', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
                          boxShadow: isOn ? `0 0 0 1px ${themeRgba.a20}` : 'none',
                        }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!weather && !loading && !error && (
          <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: `2px dashed ${themeRgba.a30}` }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem', color: themeColor, opacity: 0.4, animation: 'pulse 2s ease-in-out infinite' }}>▒▒▒</div>
            <div style={{ color: '#6b7280', fontSize: '1.1rem', fontWeight: '600' }}>AWAITING INPUT...</div>
          </div>
        )}
      </div>

      <style>{`
        .weather-icon-animated { position: relative; display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; }
        .sun { position: relative; }
        .sun-core { font-size: 5rem; animation: sunPulse 3s ease-in-out infinite; }
        .sun-rays { position: absolute; width: 100%; height: 100%; animation: sunRotate 20s linear infinite; }
        .sun-rays::before { content: '✨'; position: absolute; font-size: 2rem; top: -10px; left: 50%; transform: translateX(-50%); }
        .sun-rays::after  { content: '✨'; position: absolute; font-size: 2rem; bottom: -10px; left: 50%; transform: translateX(-50%); }
        @keyframes sunPulse  { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        @keyframes sunRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rain { display: flex; flex-direction: column; align-items: center; }
        .rain-cloud { font-size: 4.5rem; margin-bottom: -15px; z-index: 2; }
        .rain-drops { display: flex; gap: 15px; animation: rainFall 1s ease-in-out infinite; }
        .rain-drops span { font-size: 1.5rem; animation: dropFall 1s ease-in-out infinite; }
        .rain-drops span:nth-child(2) { animation-delay: 0.3s; }
        .rain-drops span:nth-child(3) { animation-delay: 0.6s; }
        @keyframes rainFall { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(10px); opacity: 0.7; } }
        @keyframes dropFall { 0% { transform: translateY(-5px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(20px); opacity: 0; } }
        .drizzle { display: flex; flex-direction: column; align-items: center; }
        .drizzle-cloud { font-size: 5rem; margin-bottom: -10px; }
        .drizzle-drops { display: flex; gap: 20px; animation: drizzleFall 1.5s ease-in-out infinite; }
        .drizzle-drops span { font-size: 1.2rem; animation: dropFall 1.5s ease-in-out infinite; }
        .drizzle-drops span:nth-child(2) { animation-delay: 0.5s; }
        @keyframes drizzleFall { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        .thunderstorm { display: flex; flex-direction: column; align-items: center; }
        .storm-cloud { font-size: 5rem; animation: stormShake 0.5s ease-in-out infinite; }
        .lightning { font-size: 2rem; margin-top: -15px; animation: lightningFlash 2s ease-in-out infinite; }
        @keyframes stormShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-2px); } 75% { transform: translateX(2px); } }
        @keyframes lightningFlash { 0%, 90%, 100% { opacity: 0; } 92%, 94% { opacity: 1; } }
        .snow { display: flex; flex-direction: column; align-items: center; }
        .snow-cloud { font-size: 4.5rem; margin-bottom: -10px; }
        .snowflakes { display: flex; gap: 12px; }
        .snowflakes span { font-size: 1.5rem; animation: snowFall 3s ease-in-out infinite; }
        .snowflakes span:nth-child(1) { animation-delay: 0s; }
        .snowflakes span:nth-child(2) { animation-delay: 1s; }
        .snowflakes span:nth-child(3) { animation-delay: 2s; }
        @keyframes snowFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(30px) rotate(360deg); opacity: 0; } }
        .clouds span { animation: cloudFloat 4s ease-in-out infinite; }
        @keyframes cloudFloat { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(10px); } }
        .mist span, .fog span { animation: mistFloat 3s ease-in-out infinite; }
        @keyframes mistFloat { 0%, 100% { opacity: 0.6; transform: translateX(0); } 50% { opacity: 0.9; transform: translateX(5px); } }
        .smoke span, .dust span { animation: smokeDrift 2s ease-in-out infinite; }
        @keyframes smokeDrift { 0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; } 50% { transform: translateX(8px) scale(1.1); opacity: 1; } }
        .windsock { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
        .windsock-pole { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%); width: 4px; height: 55px; background: linear-gradient(180deg, #374151 0%, #6b7280 100%); border-radius: 2px; box-shadow: 2px 0 4px rgba(0,0,0,0.2); }
        .windsock-pole::before { content: ''; position: absolute; top: -5px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: #374151; border-radius: 50%; box-shadow: 1px 1px 3px rgba(0,0,0,0.3); }
        .windsock-cone { position: absolute; left: 50%; top: 15px; transform-origin: 0% 0%; width: 40px; height: 16px; background: ${themeColor}; clip-path: polygon(0% 0%, 100% 50%, 0% 100%); filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.2)); transition: width 0.3s ease; }
        .wind-calm     .windsock-cone { width: 25px; opacity: 0.6; animation: windCalm     4s ease-in-out infinite; }
        .wind-light    .windsock-cone { width: 30px; opacity: 0.7; animation: windLight    2.5s ease-in-out infinite; }
        .wind-moderate .windsock-cone { width: 35px; opacity: 0.85; animation: windModerate 1.8s ease-in-out infinite; }
        .wind-strong   .windsock-cone { width: 40px; opacity: 0.95; animation: windStrong  1.2s ease-in-out infinite; }
        .wind-gale     .windsock-cone { width: 45px; opacity: 1;    animation: windGale    0.5s ease-in-out infinite; }
        @keyframes windCalm     { 0%, 100% { transform: rotate(92deg) scaleY(0.85); } 50% { transform: rotate(88deg) scaleY(0.9); } }
        @keyframes windLight    { 0%, 100% { transform: rotate(50deg) scaleY(0.9); }  50% { transform: rotate(40deg) scaleY(0.95); } }
        @keyframes windModerate { 0%, 100% { transform: rotate(18deg) scaleY(0.95); } 50% { transform: rotate(12deg) scaleY(1); } }
        @keyframes windStrong   { 0%, 100% { transform: rotate(3deg) scaleY(1); } 25% { transform: rotate(-2deg) scaleY(1.05); } 50% { transform: rotate(3deg) scaleY(1); } 75% { transform: rotate(-2deg) scaleY(1.05); } }
        @keyframes windGale     { 0% { transform: rotate(0deg) scaleY(1.05); } 15% { transform: rotate(-5deg) scaleY(1.1); } 30% { transform: rotate(4deg) scaleY(1.08); } 45% { transform: rotate(-4deg) scaleY(1.1); } 60% { transform: rotate(3deg) scaleY(1.08); } 75% { transform: rotate(-3deg) scaleY(1.1); } 90% { transform: rotate(2deg) scaleY(1.08); } 100% { transform: rotate(0deg) scaleY(1.05); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.6; } }
        ::placeholder { color: #9ca3af; opacity: 0.6; }
        @media (max-width: 1200px) {
          .weather-layout { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto auto auto !important; }
          .weather-layout > div:first-child   { grid-column: 1 / 3 !important; grid-row: 1 !important; }
          .weather-layout > div:nth-child(2)  { grid-column: 1 / 3 !important; grid-row: 2 !important; }
          .weather-layout > div:nth-child(3)  { grid-column: 1 / 3 !important; grid-row: 3 !important; }
        }
        @media (max-width: 768px) {
          .weather-layout { grid-template-columns: 1fr !important; }
          .weather-layout > div { grid-column: 1 !important; }
          h1 { font-size: 1.4rem !important; }
          .location-name { text-align: center !important; }
          .temp-display-container { grid-template-columns: 1fr !important; }
          .windsock-desktop { display: none !important; }
          .windsock-mobile  { display: block !important; }
          #weather-map { height: 400px !important; }
          .search-btn { width: 100% !important; }
        }
        @media (max-width: 480px) {
          h1 { font-size: 1.2rem !important; }
          .weather-icon-animated { width: 100px !important; height: 100px !important; }
          .sun-core, .rain-cloud, .drizzle-cloud, .storm-cloud, .clouds span { font-size: 3.5rem !important; }
        }
        * { scrollbar-width: thin; scrollbar-color: ${themeRgba.a30} transparent; }
        *::-webkit-scrollbar       { width: 8px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background-color: ${themeRgba.a30}; border-radius: 4px; }
      `}</style>
    </div>
  );
};

// ── Pure helper: marker dot HTML — defined outside component so it's stable
function markerHtml(color) {
  return `<div style="
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${color};
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.35);
  "></div>`;
}

export default WeatherApp;