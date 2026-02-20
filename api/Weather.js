// api/weather.js
// Vercel Serverless Function: secure weather API with rate limiting & caching
// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000;    // 1 minute window
const MAX_REQUESTS_PER_IP  = 10;            // max calls per IP per window
const CACHE_TTL_MS         = 5 * 60 * 1000; // cache results for 5 minutes
const CACHE_MAX_SIZE       = 100;           // max cities in cache (prevents memory leak)
const FETCH_TIMEOUT_MS     = 5000;          // abort OpenWeatherMap call after 5s
const MAX_CITY_LENGTH      = 100;

// ─────────────────────────────────────────────
// IN-MEMORY STORES
// (per-instance — sufficient for serverless cold starts)
// ─────────────────────────────────────────────

// Cache: city → { data, timestamp }
const cache = new Map();

// Rate limit: ip → [timestamp, timestamp, ...]
const ipRequestLog = new Map();

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Sanitize city name: allow only letters, spaces, hyphens, apostrophes, periods, commas.
 * Blocks injection attempts, emoji spam, etc.
 */
function sanitizeCity(city) {
  return city.trim().replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ0-9\s\-'.,]/g, '');
}

/**
 * Rate limiter: returns true if the IP is over the limit.
 * FIX: Prunes only expired entries instead of clearing the entire Map,
 * preventing legitimate IPs from losing their request history on a mass flush.
 */
function isRateLimited(ip) {
  const now = Date.now();

  // Memory guard: prune only fully-expired IP records, not the whole map
  if (ipRequestLog.size > 10000) {
    for (const [key, log] of ipRequestLog) {
      if (log.every(ts => now - ts >= RATE_LIMIT_WINDOW_MS)) {
        ipRequestLog.delete(key);
      }
    }
  }

  const log = (ipRequestLog.get(ip) || []).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);

  if (log.length >= MAX_REQUESTS_PER_IP) return true;

  log.push(now);
  ipRequestLog.set(ip, log);
  return false;
}

/**
 * Evict the oldest cache entry when the cache is full.
 * Simple FIFO eviction: removes the first (oldest) inserted key.
 */
function setCacheEntry(key, value) {
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, value);
}

/**
 * Fetch with a hard timeout. Throws if the request takes too long.
 */
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Return only the fields the frontend needs.
 * Never forward the raw API response — it may contain internal tokens or
 * undocumented fields that change between API versions.
 * FIX: Added null-guard so malformed upstream responses throw cleanly
 * instead of producing an unhandled TypeError mid-handler.
 */
function pickWeatherFields(data) {
  if (!data?.weather?.[0] || !data?.main || !data?.sys || !data?.coord) {
    throw new Error('Malformed upstream response');
  }

  return {
    name:    data.name,
    coord:   { lat: data.coord.lat, lon: data.coord.lon },
    sys:     { country: data.sys.country, sunrise: data.sys.sunrise, sunset: data.sys.sunset },
    weather: [{ main: data.weather[0].main, description: data.weather[0].description }],
    main: {
      temp:       data.main.temp,
      feels_like: data.main.feels_like,
      temp_min:   data.main.temp_min,
      temp_max:   data.main.temp_max,
      humidity:   data.main.humidity,
      pressure:   data.main.pressure,
    },
    wind:       { speed: data.wind?.speed ?? 0 },
    visibility: data.visibility ?? null,
    timezone:   data.timezone,
  };
}

// ─────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────
export default async function handler(req, res) {

  // ── Security headers ──────────────────────
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');

  // ── CORS ──────────────────────────────────
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'Method not allowed' });

  try {
    // ── Extract & validate input ──────────────
    const { city } = req.query;

    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    if (city.length > MAX_CITY_LENGTH) {
      return res.status(400).json({ error: 'City name too long' });
    }

    const sanitized = sanitizeCity(city);
    if (!sanitized) {
      return res.status(400).json({ error: 'Invalid city name' });
    }

    // ── Rate limiting ────────────────────────
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ip    = rawIp.split(',')[0].trim();

    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }

    // ── Cache lookup ─────────────────────────
    const cacheKey = sanitized.toLowerCase();
    const cached   = cache.get(cacheKey);
    const now      = Date.now();

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached.data);
    }

    // ── API key check ────────────────────────
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
      console.error('[weather] OPENWEATHER_API_KEY is not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // ── Fetch from OpenWeatherMap ─────────────
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(sanitized)}&appid=${API_KEY}&units=metric`;

    let response;
    try {
      response = await fetchWithTimeout(apiUrl, FETCH_TIMEOUT_MS);
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).json({ error: 'Weather service timed out. Try again.' });
      }
      throw err;
    }

    const raw = await response.json();

    // ── Handle upstream errors ────────────────
    if (!response.ok) {
      const safeError = response.status === 404
        ? 'Location not found'
        : 'Failed to fetch weather data';
      return res.status(response.status).json({ error: safeError });
    }

    // ── Shape & cache response ────────────────
    const data = pickWeatherFields(raw);
    setCacheEntry(cacheKey, { data, timestamp: now });

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(data);

  } catch (error) {
    console.error('[weather] Unhandled error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}