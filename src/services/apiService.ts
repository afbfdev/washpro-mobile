import { Technician, Booking, BookingPhoto, BookingStatus } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

const headers = {
  'Content-Type': 'application/json',
  'X-Admin-Password': ADMIN_PASSWORD,
};

export const fetchTechnicians = async (): Promise<Technician[]> => {
  const res = await fetch(`${API_BASE_URL}/api/admin/technicians`, { headers });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  const data = await res.json();
  // API wraps in { success: true, technicians: [...] }
  return data.technicians || data;
};

export const fetchBookings = async (): Promise<Booking[]> => {
  const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, { headers });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  const data = await res.json();
  // API wraps in { success: true, bookings: [...] }
  return data.bookings || data;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<Booking> => {
  const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ bookingId, status }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  return res.json();
};

export const fetchBookingPhotos = async (bookingId: string): Promise<BookingPhoto[]> => {
  const res = await fetch(
    `${API_BASE_URL}/api/bookings/photos?bookingId=${bookingId}`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  return res.json();
};

export const savePushToken = async (
  technicianId: string,
  token: string
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/technicians/push-token`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ technicianId, token }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
};

export const uploadBookingPhoto = async (
  bookingId: string,
  url: string,
  type: 'BEFORE' | 'AFTER'
): Promise<BookingPhoto> => {
  const res = await fetch(`${API_BASE_URL}/api/bookings/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, url, type }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  return res.json();
};
