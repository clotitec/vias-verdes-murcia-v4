export interface WeatherCurrent {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  uv_index: number;
}

export interface WeatherDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  uv_index_max: number[];
}

export interface WeatherData {
  current: WeatherCurrent;
  daily: WeatherDaily;
  fetchedAt: number;
}

export type RecommendationScore = 'bueno' | 'precaucion' | 'no_recomendado';

export interface WeatherWarning {
  type: 'danger' | 'warning' | 'info';
  icon: string;
  text: string;
}

export interface WeatherRecommendation {
  score: RecommendationScore;
  warnings: WeatherWarning[];
}

export interface WMOCode {
  icon: string;
  iconNight: string;
  desc: string;
}
