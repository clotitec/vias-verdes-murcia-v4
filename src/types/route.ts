export type Difficulty = 'easy' | 'medium' | 'moderate';
export type RouteType = 'lineal' | 'circular';
export type RouteStatus = 'operational' | 'coming_soon';

export interface RouteColor {
  main: string;
  glow: string;
}

export interface Route {
  id: string;
  num: number;
  color: RouteColor;
  name: string;
  desc: string;
  km: string;
  time: string;
  diff: Difficulty;
  type: RouteType;
  location: string;
  municipality: string;
  tags: string[];
  status: RouteStatus;
  image: string;
  url360?: string;
  gpxFile?: string;
  coords: [number, number, number][]; // [lon, lat, elev]
}
