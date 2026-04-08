import type { WeatherData, WMOCode, WeatherRecommendation, RecommendationScore, WeatherWarning } from '@/types/weather';

const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const ROUTE_START_COORDS: Record<string, [number, number]> = {
  vv1: [37.7639, -1.4954],
  vv2: [37.6901, -1.2859],
  vv3: [38.0205, -1.1718],
  vv4: [37.4761, -1.7781],
  vv5: [38.3670, -1.4515],
  vv6: [38.6165, -1.0123],
  vv7: [37.4090, -1.5670],
  vv8: [38.2833, -1.4785],
};

export const WMO_CODES: Record<number, WMOCode> = {
  0:  { icon: '☀️', iconNight: '🌙', desc: 'Despejado' },
  1:  { icon: '🌤️', iconNight: '🌙', desc: 'Mayormente despejado' },
  2:  { icon: '⛅', iconNight: '☁️', desc: 'Parcialmente nublado' },
  3:  { icon: '☁️', iconNight: '☁️', desc: 'Nublado' },
  45: { icon: '🌫️', iconNight: '🌫️', desc: 'Niebla' },
  48: { icon: '🌫️', iconNight: '🌫️', desc: 'Niebla con escarcha' },
  51: { icon: '🌦️', iconNight: '🌧️', desc: 'Llovizna ligera' },
  53: { icon: '🌦️', iconNight: '🌧️', desc: 'Llovizna moderada' },
  55: { icon: '🌧️', iconNight: '🌧️', desc: 'Llovizna intensa' },
  61: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia ligera' },
  63: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia moderada' },
  65: { icon: '🌧️', iconNight: '🌧️', desc: 'Lluvia intensa' },
  66: { icon: '🌨️', iconNight: '🌨️', desc: 'Lluvia helada ligera' },
  67: { icon: '🌨️', iconNight: '🌨️', desc: 'Lluvia helada intensa' },
  71: { icon: '❄️', iconNight: '❄️', desc: 'Nieve ligera' },
  73: { icon: '❄️', iconNight: '❄️', desc: 'Nieve moderada' },
  75: { icon: '❄️', iconNight: '❄️', desc: 'Nieve intensa' },
  77: { icon: '🌨️', iconNight: '🌨️', desc: 'Granizo' },
  80: { icon: '🌦️', iconNight: '🌧️', desc: 'Chubascos ligeros' },
  81: { icon: '🌧️', iconNight: '🌧️', desc: 'Chubascos moderados' },
  82: { icon: '🌧️', iconNight: '🌧️', desc: 'Chubascos intensos' },
  85: { icon: '🌨️', iconNight: '🌨️', desc: 'Nieve ligera' },
  86: { icon: '🌨️', iconNight: '🌨️', desc: 'Nieve intensa' },
  95: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta' },
  96: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta con granizo' },
  99: { icon: '⛈️', iconNight: '⛈️', desc: 'Tormenta con granizo intenso' },
};

export function getWeatherIcon(weatherCode: number, isDay: boolean): string {
  const wmo = WMO_CODES[weatherCode] || WMO_CODES[0];
  return isDay ? wmo.icon : wmo.iconNight;
}

export function getWeatherDesc(weatherCode: number): string {
  return (WMO_CODES[weatherCode] || WMO_CODES[0]).desc;
}

export function getWindDirection(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(degrees / 45) % 8];
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data: WeatherData = JSON.parse(cached);
        if (Date.now() - data.fetchedAt < WEATHER_CACHE_TTL) return data;
      }
    } catch { /* ignore */ }
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Europe%2FMadrid&forecast_days=4`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();

    const data: WeatherData = {
      current: json.current,
      daily: json.daily,
      fetchedAt: Date.now(),
    };

    if (typeof window !== 'undefined') {
      try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch { /* ignore */ }
    }

    return data;
  } catch {
    return null;
  }
}

export function getWeatherRecommendation(data: WeatherData): WeatherRecommendation {
  const warnings: WeatherWarning[] = [];
  let score = 'bueno' as RecommendationScore;

  const { temperature_2m, wind_speed_10m, weather_code, uv_index } = data.current;

  // Temperature
  if (temperature_2m > 38) {
    warnings.push({ type: 'danger', icon: '🌡️', text: 'Temperatura extrema. No recomendado.' });
    score = 'no_recomendado';
  } else if (temperature_2m > 35) {
    warnings.push({ type: 'warning', icon: '🌡️', text: 'Calor intenso. Llevar mucha agua.' });
    if (score !== 'no_recomendado') score = 'precaucion';
  } else if (temperature_2m < 5) {
    warnings.push({ type: 'warning', icon: '🥶', text: 'Frio intenso. Abrigarse bien.' });
    if (score !== 'no_recomendado') score = 'precaucion';
  }

  // Wind
  if (wind_speed_10m > 50) {
    warnings.push({ type: 'danger', icon: '💨', text: 'Viento muy fuerte. Peligroso.' });
    score = 'no_recomendado';
  } else if (wind_speed_10m > 30) {
    warnings.push({ type: 'warning', icon: '💨', text: 'Viento fuerte. Precaucion en puentes.' });
    if (score !== 'no_recomendado') score = 'precaucion';
  }

  // Rain/Storm
  if (weather_code >= 95) {
    warnings.push({ type: 'danger', icon: '⛈️', text: 'Tormenta activa. No salir.' });
    score = 'no_recomendado';
  } else if (weather_code >= 61) {
    warnings.push({ type: 'warning', icon: '🌧️', text: 'Lluvia. Firme resbaladizo.' });
    if (score !== 'no_recomendado') score = 'precaucion';
  }

  // UV
  if (uv_index >= 8) {
    warnings.push({ type: 'warning', icon: '☀️', text: 'UV muy alto. Proteccion solar.' });
    if (score === 'bueno') score = 'precaucion';
  }

  if (warnings.length === 0) {
    warnings.push({ type: 'info', icon: '✅', text: 'Condiciones ideales para la ruta.' });
  }

  return { score, warnings };
}
