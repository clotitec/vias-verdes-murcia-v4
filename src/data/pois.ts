import type { POIFeature, POIType } from '@/types/poi';
import { viasVerdes } from '@/data/routes';
import { interpolateCoord } from '@/lib/geo';

function getCoord(routeId: string, km: number): [number, number] {
  const route = viasVerdes.find((v) => v.id === routeId);
  if (!route || !route.coords || route.coords.length < 2) return [0, 0];
  const totalKm = parseFloat(route.km);
  const reversed = routeId === 'vv6';
  return interpolateCoord(route.coords, totalKm, km, reversed);
}

function poi(
  id: string,
  routeId: string,
  orden: number,
  tipo: POIType,
  titulo: string,
  descripcion: string,
  coords: [number, number],
  urlTour?: string
): POIFeature {
  return {
    type: 'Feature',
    properties: {
      id,
      id_ruta: routeId,
      orden_ruta: orden,
      tipo,
      titulo,
      descripcion,
      url_tour: urlTour || '',
    },
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
  };
}

export function generateAllPois(): POIFeature[] {
  const features: POIFeature[] = [];

  // VV1 - Campo de Cartagena (51 km)
  features.push(poi('vv1_est_001', 'vv1', 1, 'estacion', 'Inicio - Barrio de Los Dolores', 'Area de acogida y panel informativo. Conexion con carril bici hacia el puerto de Cartagena.', getCoord('vv1', 0)));
  features.push(poi('vv1_est_002', 'vv1', 2, 'estacion', 'Estacion de El Romeral', 'Edificio historico abandonado de grandes dimensiones.', getCoord('vv1', 41.4)));
  features.push(poi('vv1_est_003', 'vv1', 3, 'estacion', 'Estacion de Tren de Totana', 'Final de la Via Verde. Conexion con linea Cercanias Murcia-Aguilas.', getCoord('vv1', 51)));
  features.push(poi('vv1_pue_001', 'vv1', 4, 'pueblo', 'La Aljorra', 'Pueblo principal con servicios completos.', getCoord('vv1', 7.9)));
  features.push(poi('vv1_pue_002', 'vv1', 5, 'pueblo', 'Fuente Alamo de Murcia', 'Villa con todos los servicios.', getCoord('vv1', 20.8)));
  features.push(poi('vv1_pue_003', 'vv1', 6, 'pueblo', 'La Pinilla', 'Conexion con la Via Verde de Mazarron.', getCoord('vv1', 27)));
  features.push(poi('vv1_pue_004', 'vv1', 7, 'pueblo', 'Cartagena', 'Muralla Punica, Teatro Romano, Museos.', getCoord('vv1', 0)));
  features.push(poi('vv1_pue_005', 'vv1', 8, 'pueblo', 'Totana', 'Santuario de Santa Eulalia, Yacimiento argarico de La Bastida.', getCoord('vv1', 51)));
  features.push(poi('vv1_des_001', 'vv1', 9, 'area_descanso', 'Area de Descanso Taibilla', 'Junto al deposito de la Mancomunidad de Canales del Taibilla.', getCoord('vv1', 3.9)));
  features.push(poi('vv1_des_002', 'vv1', 10, 'area_descanso', 'Area de Descanso Casa Grande', 'Situada en un vertice del rodeo a la finca Casa Grande.', getCoord('vv1', 16)));
  features.push(poi('vv1_pue_006', 'vv1', 11, 'puente', 'Pasarela Metalica RM-E11', 'Gran pasarela peatonal/ciclista sobre la carretera RM-E11.', getCoord('vv1', 36.2)));
  features.push(poi('vv1_pue_007', 'vv1', 12, 'puente', 'Puente sobre el Rio Guadalentin', 'Principal obra de fabrica de este tramo.', getCoord('vv1', 46.2)));
  features.push(poi('vv1_pat_001', 'vv1', 13, 'patrimonio', 'Iglesia de Na Sa de Monserrat', 'Iglesia del siglo XVII en La Pinilla.', getCoord('vv1', 27)));
  features.push(poi('vv1_mir_001', 'vv1', 18, 'mirador', 'Saladares del Guadalentin', 'Zona esteparia protegida cerca de la Estacion de El Romeral.', getCoord('vv1', 42)));
  features.push(poi('vv1_tun_001', 'vv1', 20, 'tunel', 'Paso inferior Autovia RM-23', 'Paso inferior bajo la autovia.', getCoord('vv1', 40.1)));

  // VV2 - Mazarron (13.8 km)
  features.push(poi('vv2_des_001', 'vv2', 1, 'area_descanso', 'Inicio La Pinilla - Bifurcacion', 'Punto de inicio oficial.', getCoord('vv2', 0)));
  features.push(poi('vv2_mir_001', 'vv2', 5, 'mirador', 'Mirador Sierra del Algarrobo', 'Trincheras curvadas con vistas panoramicas.', getCoord('vv2', 1.5)));
  features.push(poi('vv2_mir_002', 'vv2', 6, 'mirador', 'Alto de las Hermanillas', 'Relieves volcanicos coronados por despuntes rocosos.', getCoord('vv2', 7)));
  features.push(poi('vv2_mir_003', 'vv2', 7, 'mirador', 'Paisaje Minero Cerro San Cristobal', 'Paisaje lunar de tierras rojas y amarillas.', getCoord('vv2', 12.8)));
  features.push(poi('vv2_pue_001', 'vv2', 8, 'puente', 'Puente Rambla Fuente de la Pinilla', 'Gran puente de hormigon.', getCoord('vv2', 4)));
  features.push(poi('vv2_pat_001', 'vv2', 11, 'patrimonio', 'Ermita de San Jose del Saladillo', 'Ermita historica.', getCoord('vv2', 6)));
  features.push(poi('vv2_pat_002', 'vv2', 12, 'patrimonio', 'Coto Minero San Cristobal', 'Zona minera historica.', getCoord('vv2', 12.8)));
  features.push(poi('vv2_pbl_002', 'vv2', 14, 'pueblo', 'Mazarron', 'Casas Consistoriales, Iglesia de San Andres, Castillo de los Velez.', getCoord('vv2', 13.8)));

  // VV3 - Noroeste (78 km)
  features.push(poi('vv3_est_001', 'vv3', 1, 'estacion', 'Campus de Espinardo - Inicio', 'Punto de inicio oficial.', getCoord('vv3', 0)));
  features.push(poi('vv3_tun_001', 'vv3', 3, 'tunel', 'Tunel 1 - Espinardo', 'Galeria recta de 200 metros, bien iluminada.', getCoord('vv3', 3.9)));
  features.push(poi('vv3_est_003', 'vv3', 5, 'estacion', 'Estacion de Molina de Segura', 'Actualmente gestionada por Cruz Roja.', getCoord('vv3', 7.1)));
  features.push(poi('vv3_pue_001', 'vv3', 7, 'puente', 'Puente de Hierro - Rio Segura', 'Imponente puente metalico restaurado.', getCoord('vv3', 9.1)));
  features.push(poi('vv3_alb_001', 'vv3', 8, 'albergue', 'Albergue Estacion de Alguazas', 'Antigua estacion recuperada como albergue y cafeteria.', getCoord('vv3', 9.7)));
  features.push(poi('vv3_mir_001', 'vv3', 9, 'mirador', 'Inicio Badlands', 'El paisaje cambia de huerta a tierras baldias.', getCoord('vv3', 12.4)));
  features.push(poi('vv3_est_004', 'vv3', 11, 'estacion', 'Estacion de Los Rodeos', 'Estacion abandonada con area de descanso.', getCoord('vv3', 19.1)));
  features.push(poi('vv3_alb_002', 'vv3', 12, 'albergue', 'Albergue Estacion Campos del Rio', 'Estacion recuperada como albergue.', getCoord('vv3', 22.4)));
  features.push(poi('vv3_pue_006', 'vv3', 20, 'puente', 'Viaducto La Sultana - Rio Mula', 'Espectacular viaducto sobre el rio.', getCoord('vv3', 32.7)));
  features.push(poi('vv3_pbl_001', 'vv3', 21, 'pueblo', 'Mula', 'Gran patrimonio historico: Castillo de los Velez.', getCoord('vv3', 34.5)));
  features.push(poi('vv3_tun_002', 'vv3', 23, 'tunel', 'Zona de 4 Tuneles (Mula-Bullas)', 'Concentracion de 4 tuneles.', getCoord('vv3', 42)));
  features.push(poi('vv3_pue_007', 'vv3', 25, 'puente', 'Viaducto Rio Mula (La Luz)', 'Gran viaducto de ocho arcos.', getCoord('vv3', 46)));
  features.push(poi('vv3_pbl_002', 'vv3', 26, 'pueblo', 'Bullas', 'Punto mas alto de la ruta (630m). Famoso por sus bodegas.', getCoord('vv3', 52)));
  features.push(poi('vv3_pat_001', 'vv3', 31, 'patrimonio', 'Ruinas de Begastri', 'Antigua ciudad romano-visigoda.', getCoord('vv3', 69)));
  features.push(poi('vv3_alb_006', 'vv3', 32, 'albergue', 'Albergue Estacion de Cehegin', 'Ofrece albergue y restaurante.', getCoord('vv3', 70.4)));
  features.push(poi('vv3_pat_002', 'vv3', 36, 'patrimonio', 'Basilica de la Vera Cruz', 'Ciudad Santa de Caravaca de la Cruz.', getCoord('vv3', 78)));
  features.push(poi('vv3_pbl_003', 'vv3', 37, 'pueblo', 'Caravaca de la Cruz', 'Ciudad Santa. Basilica de la Vera Cruz.', getCoord('vv3', 78)));

  // VV4 - Almendricos (6.6 km)
  features.push(poi('vv4_est_001', 'vv4', 1, 'estacion', 'Apeadero de Almendricos', 'Punto de inicio con paneles informativos.', getCoord('vv4', 0)));
  features.push(poi('vv4_pat_001', 'vv4', 2, 'patrimonio', 'Yacimiento argarico El Rincon', 'Poblado de la Edad del Bronce.', getCoord('vv4', 0.5)));
  features.push(poi('vv4_mir_001', 'vv4', 5, 'mirador', 'Mirador Limite Regional', 'Punto donde termina Murcia y comienza Andalucia.', getCoord('vv4', 6.6)));

  // VV5 - Chicharra Cieza (13.7 km)
  features.push(poi('vv5_des_001', 'vv5', 1, 'area_descanso', 'Area Casa del Manchego', 'Limite norte de la Via Verde.', getCoord('vv5', 0)));
  features.push(poi('vv5_est_001', 'vv5', 2, 'estacion', 'Apeadero de Las Lomas', 'Area de acogida en el antiguo apeadero.', getCoord('vv5', 4.1)));
  features.push(poi('vv5_mir_001', 'vv5', 4, 'mirador', 'Mirador de Badlands', 'Zona de paisaje arido.', getCoord('vv5', 9.7)));
  features.push(poi('vv5_pue_001', 'vv5', 5, 'puente', 'Viaducto Rambla del Judio', 'Pasarela metalica roja de mas de 40 metros.', getCoord('vv5', 11.2)));
  features.push(poi('vv5_pbl_001', 'vv5', 7, 'pueblo', 'Cieza', 'Ciudad del melocoton.', getCoord('vv5', 13.7)));

  // VV6 - Chicharra Yecla (9 km)
  features.push(poi('vv6_est_001', 'vv6', 1, 'estacion', 'Antigua Estacion de Yecla', 'Punto de inicio del itinerario historico.', getCoord('vv6', 0)));
  features.push(poi('vv6_pbl_001', 'vv6', 2, 'pueblo', 'Yecla', 'Ciudad vinicola al norte de la Region de Murcia.', getCoord('vv6', 0)));
  features.push(poi('vv6_mir_001', 'vv6', 3, 'mirador', 'Mirador Sierra del Buey', 'Vistas panoramicas al paisaje agricola.', getCoord('vv6', 4)));

  // VV7 - Embarcadero del Hornillo (1.2 km)
  features.push(poi('vv7_pbl_001', 'vv7', 1, 'pueblo', 'Aguilas', 'Nucleo urbano donde se encuentra toda la ruta.', getCoord('vv7', 0)));
  features.push(poi('vv7_est_001', 'vv7', 2, 'estacion', 'Estacion de Aguilas', 'Museo del Ferrocarril en el sotano.', getCoord('vv7', 0)));
  features.push(poi('vv7_pat_001', 'vv7', 3, 'patrimonio', 'Locomotora La Pava', 'Locomotora de vapor de 1890 (Glasgow).', getCoord('vv7', 0)));
  features.push(poi('vv7_tun_001', 'vv7', 6, 'tunel', 'Tunel Musealizado', 'Centro de Interpretacion.', getCoord('vv7', 0.85)));
  features.push(poi('vv7_mir_001', 'vv7', 8, 'mirador', 'Mirador del Embarcadero', 'Vistas panoramicas a la Bahia del Hornillo.', getCoord('vv7', 1)));
  features.push(poi('vv7_pat_002', 'vv7', 9, 'patrimonio', 'Embarcadero del Hornillo (BIC)', 'Estructura iconica de acero y hormigon (1903). Bien de Interes Cultural.', getCoord('vv7', 1.1)));

  // VV8 - Floracion (4.5 km)
  features.push(poi('vv8_mir_001', 'vv8', 1, 'mirador', 'Mirador de La Macetua', 'Vistas a los campos de melocotoneros en flor.', getCoord('vv8', 2)));
  features.push(poi('vv8_est_001', 'vv8', 2, 'estacion', 'Antigua Estacion de La Macetua', 'Estacion historica en la ruta de la floracion.', getCoord('vv8', 3)));
  features.push(poi('vv8_pbl_001', 'vv8', 3, 'pueblo', 'Cieza (conexion)', 'Conexion con la V.V. del Chicharra Cieza.', getCoord('vv8', 0)));

  return features;
}
