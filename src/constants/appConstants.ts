// Constantes synchronisées avec zeroeau-shine-onepageupdate

// Zones de Casablanca
export const ZONES: Record<string, { name: string; areas: string }> = {
  ZONE_1: { name: 'Zone 1', areas: 'Maarif, Beau séjour, Palmier, Yacoub el mansour' },
  ZONE_2: { name: 'Zone 2', areas: 'Médina, Bourgogne, Corniche Ain Diab' },
  ZONE_3: { name: 'Zone 3', areas: 'Sidi Maarouf, Oasis, Californie' },
  ZONE_4: { name: 'Zone 4', areas: 'Bouskoura, Rahma, Victoria' },
  ZONE_5: { name: 'Zone 5', areas: 'Ain Sebaa, Bernoussi, Hay Mohammadi, Roches Noires' },
};

// Motifs d'annulation prédéfinis
export const CANCELLATION_REASONS = [
  'Client injoignable',
  'Client absent au rendez-vous',
  'Client a annulé / reporté',
  'Client a donné une mauvaise adresse',
  'Véhicule non disponible',
  'Conflit de planning',
  'Retard important impossible à rattraper',
  'Zone non couverte / hors périmètre',
  'Service non réalisable sur place (véhicule trop sale, accès impossible, conditions non adaptées)',
  'Conditions météo défavorables',
  'Problème technique / matériel',
  'Technicien indisponible',
  'Erreur de réservation',
  'Double réservation / doublon',
  'Décision interne (qualité / sécurité)',
  'Annulation à la demande du partenaire',
  'Autre (préciser)',
];

// Durées estimées par véhicule et service (en minutes)
export const SERVICE_DURATIONS: Record<string, Record<string, number>> = {
  citadine: {
    express: 52,
    brillance: 60,
    gold: 90,
    royale: 120,
  },
  berline: {
    express: 60,
    brillance: 60,
    gold: 90,
    royale: 120,
  },
  suvMoyen: {
    express: 70,
    brillance: 80,
    gold: 105,
    royale: 150,
  },
  suvGrand: {
    express: 70,
    brillance: 80,
    gold: 105,
    royale: 150,
  },
  petiteMoto: {
    express: 30,
    brillance: 30,
  },
  grandeMoto: {
    express: 45,
    brillance: 45,
  },
  moto: {
    express: 37,
    brillance: 37,
  },
};

// Labels des services
export const SERVICE_LABELS: Record<string, string> = {
  express: 'Express',
  brillance: 'Brillance',
  gold: 'Gold',
  royale: 'Royale',
};

// Labels des types de véhicules
export const VEHICLE_LABELS: Record<string, string> = {
  citadine: 'Citadine',
  berline: 'Berline',
  suvMoyen: 'SUV Moyen',
  suvGrand: 'SUV Grand',
  petiteMoto: 'Petite Moto',
  grandeMoto: 'Grande Moto',
  moto: 'Moto',
};

// Marges de tolérance (en minutes)
export const PUNCTUALITY_MARGIN = 15;
export const DURATION_TOLERANCE = 15;
