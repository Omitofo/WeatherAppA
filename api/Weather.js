// api/weather.js
// Vercel Serverless Function to handle weather API requests securely

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city } = req.query;

    // Validate city parameter
    if (!city || city.trim() === '') {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    // Get API key from environment variable
    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) {
      console.error('OPENWEATHER_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Make request to OpenWeatherMap API
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Location not found' });
      }
      return res.status(response.status).json({ 
        error: data.message || 'Failed to fetch weather data' 
      });
    }

    // Return weather data
    return res.status(200).json(data);

  } catch (error) {
    console.error('Weather API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}