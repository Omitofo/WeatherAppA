// api/tiles.js — proxies OWM map tiles to avoid regional blocking
export default async function handler(req, res) {
  const { layer, z, x, y } = req.query;

  const ALLOWED_LAYERS = [
    'precipitation_new', 'clouds_new', 'wind_new', 'temp_new'
  ];

  if (!ALLOWED_LAYERS.includes(layer)) {
    return res.status(400).json({ error: 'Invalid layer' });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY; // reuse your existing secret key
  const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).end();
    }

    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600'); // cache tiles 10min
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error('[tiles] fetch error:', err);
    res.status(502).end();
  }
}