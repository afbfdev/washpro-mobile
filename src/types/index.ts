// === Booking Status ===
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// === Vehicle Types ===
export type VehicleType = 'citadine' | 'berline' | 'suvMoyen' | 'suvGrand' | 'petiteMoto' | 'grandeMoto' | 'moto';

// === Service Tiers ===
export type ServiceTier = 'express' | 'brillance' | 'gold' | 'royale';

// === Booking Photo ===
export interface BookingPhoto {
  id: string;
  url: string;
  type: 'BEFORE' | 'AFTER';
  createdAt: string;
}

// === Booking Validation (synced with API) ===
export interface BookingValidation {
  photosBeforeValid: boolean;
  photosAfterValid: boolean;
  punctualityValid: boolean;
  durationValid: boolean;
  qrCodeReviewRequested: boolean;
  score: number;
  photosBeforeCount: number;
  photosAfterCount: number;
}

// === Technician (synced with API) ===
export interface Technician {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  zone: string | null;
  isActive: boolean;
  bookingsCount: number;
  createdAt: string;
}

// === Booking Technician (nested in booking response) ===
export interface BookingTechnician {
  id: string;
  fullName: string;
  phone: string;
  zone?: string | null;
}

// === Booking Customer (nested in booking response) ===
export interface BookingCustomer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  totalBookings: number;
  totalSpent: number;
}

// === Booking (synced with API) ===
export interface Booking {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  vehicleType: string;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleYear: string | null;
  vehicleColor: string | null;
  serviceTier: string;
  amount: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  date: string;
  time: string;
  comments: string | null;
  partnerCode: string | null;
  status: BookingStatus;
  source: string;
  internalNote: string | null;
  technicianId: string | null;
  technician: BookingTechnician | null;
  customerId: string | null;
  customer: BookingCustomer | null;
  assignedAt: string | null;
  receivedAt: string;
  confirmedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  qrCodeReviewRequested: boolean;
  photos: BookingPhoto[];
  validation?: BookingValidation;
}

// === Location ===
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

// === Navigation Types ===
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  MissionDetail: { missionId: string };
};

export type TabParamList = {
  Missions: undefined;
  History: undefined;
  Profile: undefined;
};
