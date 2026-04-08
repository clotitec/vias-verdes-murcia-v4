export type POIType =
  | 'estacion'
  | 'pueblo'
  | 'mirador'
  | 'puente'
  | 'tunel'
  | 'area_descanso'
  | 'patrimonio'
  | 'panel_interpretativo'
  | 'punto_conflictivo'
  | 'servicio'
  | 'albergue';

export interface POIProperties {
  id: string;
  id_ruta: string;
  orden_ruta: number;
  tipo: POIType;
  titulo: string;
  descripcion: string;
  url_tour?: string;
}

export interface POIFeature {
  type: 'Feature';
  properties: POIProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
}
