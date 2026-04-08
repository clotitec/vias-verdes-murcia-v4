export type TransportType = 'train' | 'bus' | 'bus_station' | 'tram' | 'halt' | 'taxi';

export interface TransportStop {
  id: string | number;
  lat: number;
  lon: number;
  name: string;
  type: TransportType;
  operator: string;
  lines: string[];
  distance?: number;
}

export interface RouteTransport {
  start: TransportStop[];
  end: TransportStop[];
}
