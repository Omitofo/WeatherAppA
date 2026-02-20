// api/tiles.js — proxies OWM map tiles to avoid regional blocking

const ALLOWED_LAYERS = ['precipitation_new', 'clouds_new', 'wind_new', 'temp_new'];
const FETCH_TIMEOUT_MS = 5000;
const MAX_TILE_COORD   = 2 ** 22; // z goes up to 22, x/y up to 2^z

/**
 * Fetch with a hard timeout to prevent serverless function hangs.
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

export default async function handler(req, res) {
  const { layer, z, x, y } = req.query;

  // ── Validate layer ────────────────────────────────────────────────────────
  if (!ALLOWED_LAYERS.includes(layer)) {
    return res.status(400).json({ error: 'Invalid layer' });
  }

  // ── FIX: Validate tile coordinates ───────────────────────────────────────
  // z, x, y come in as strings from the query — parse to integers and sanity-
  // check before interpolating into the upstream URL. Without this a caller
  // could send z=../../etc/passwd or a negative number and forward it to OWM.
  const zn = parseInt(z, 10);
  const xn = parseInt(x, 10);
  const yn = parseInt(y, 10);

  if (
    !Number.isInteger(zn) || zn < 0 || zn > 22  ||
    !Number.isInteger(xn) || xn < 0 || xn >= MAX_TILE_COORD ||
    !Number.isInteger(yn) || yn < 0 || yn >= MAX_TILE_COORD
  ) {
    return res.status(400).json({ error: 'Invalid tile coordinates' });
  }

  // ── API key ───────────────────────────────────────────────────────────────
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('[tiles] OPENWEATHER_API_KEY is not configured');
    return res.status(500).end();
  }

  const url = `https://tile.openweathermap.org/map/${layer}/${zn}/${xn}/${yn}.png?appid=${apiKey}`;

  try {
    // ── FIX: Apply timeout to prevent hanging serverless functions ───────────
    let response;
    try {
      response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    } catch (err) {
      if (err.name === 'AbortError') {
        return res.status(504).end(); // tile fetch timed out
      }
      throw err;
    }

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600'); // cache tiles 10 min
    // NOTE: Using '*' here intentionally — tiles contain no user data and are
    // publicly accessible. Align with ALLOWED_ORIGIN if the app becomes private.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));

  } catch (err) {
    console.error('[tiles] fetch error:', err);
    res.status(502).end();
  }
}