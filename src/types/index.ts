// === Booking Status ===
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// === Vehicle Types ===
export type VehicleType = 'citadine' | 'berline' | 'suvMoyen' | 'suvGrand' | 'petiteMoto' | 'grandeMoto';

// === Service Tiers ===
export type ServiceTier = 'express' | 'brillance' | 'gold' | 'royale';

// === Booking Photo ===
export interface BookingPhoto {
  id: string;
  url: string;
  type: 'BEFORE' | 'AFTER';
  createdAt: string;
}

// === Booking Validation ===
export interface BookingValidation {
  photosBeforeValid: boolean;
  photosAfterValid: boolean;
  punctualityValid: boolean;
  durationValid: boolean;
  qrCodeReviewRequested: boolean;
  score: number;
}

// === Technician ===
export interface Technician {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  zone: string;
  isActive: boolean;
}

// === Booking ===
export interface Booking {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleBrand: string;
  vehicleModel: string;
  serviceTier: ServiceTier;
  amount: number;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  time: string;
  comments?: string;
  status: BookingStatus;
  technicianId?: string;
  technician?: Technician;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  photos?: BookingPhoto[];
  validation?: BookingValidation;
}

// === Location (kept from original) ===
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
  Assistant: undefined;
  Profile: undefined;
};
