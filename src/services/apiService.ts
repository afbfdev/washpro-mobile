import { Technician, Booking, BookingPhoto, BookingStatus } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

const headers = {
  'Content-Type': 'application/json',
  'X-Admin-Password': ADMIN_PASSWORD,
};

// IDs des missions B2B connues, pour router les actions (statut, photos) vers les
// endpoints B2B. Rempli à chaque fetchBookings().
const b2bBookingIds = new Set<string>();
const isB2BId = (bookingId: string) => b2bBookingIds.has(bookingId);

export const fetchTechnicians = async (): Promise<Technician[]> => {
  const res = await fetch(`${API_BASE_URL}/api/admin/technicians`, { headers });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  const data = await res.json();
  // API wraps in { success: true, technicians: [...] }
  return data.technicians || data;
};

// Normalise une réservation B2B vers la forme d'une réservation classique, pour
// réutiliser tel quel le store et les écrans. Le nom affiché = nom de l'entreprise.
const mapB2BToBooking = (b: any): Booking => ({
  id: b.id,
  fullName: b.company?.name ?? 'Entreprise',
  phone: b.company?.phone ?? '',
  email: null,
  vehicleType: b.vehicle?.vehicleType ?? '',
  vehicleBrand: b.vehicle?.brand ?? null,
  vehicleModel: b.vehicle?.model ?? null,
  vehicleYear: null,
  vehicleColor: null,
  serviceTier: b.serviceTier,
  amount: b.totalAmount,
  address: b.address,
  latitude: null,
  longitude: null,
  date: b.date,
  time: b.time,
  comments: null,
  partnerCode: null,
  status: b.status,
  source: 'B2B',
  internalNote: null,
  technicianId: b.technicianId ?? null,
  technician: b.technician ?? null,
  customerId: null,
  customer: null,
  assignedAt: null,
  receivedAt: b.createdAt,
  confirmedAt: b.confirmedAt ?? null,
  startedAt: b.startedAt ?? null,
  completedAt: b.completedAt ?? null,
  cancelledAt: b.cancelledAt ?? null,
  cancellationReason: b.cancellationReason ?? null,
  createdAt: b.createdAt,
  qrCodeReviewRequested: b.qrCodeReviewRequested ?? false,
  photos: [],
  validation: b.validation,
  isB2B: true,
});

export const fetchBookings = async (): Promise<Booking[]> => {
  // Réservations classiques + B2B en parallèle. Le B2B est tolérant à l'échec :
  // si son endpoint échoue, on garde au moins les réservations classiques.
  const [regData, b2bData] = await Promise.all([
    fetch(`${API_BASE_URL}/api/admin/bookings`, { headers }).then(async (r) => {
      if (!r.ok) throw new Error(`Erreur ${r.status}: ${r.statusText}`);
      return r.json();
    }),
    fetch(`${API_BASE_URL}/api/admin/b2b/bookings?limit=1000&sortField=date&sortDir=asc`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const regular: Booking[] = regData.bookings || regData || [];
  const b2b: Booking[] = (b2bData?.bookings || []).map(mapB2BToBooking);

  b2bBookingIds.clear();
  for (const b of b2b) b2bBookingIds.add(b.id);

  return [...regular, ...b2b];
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<Booking> => {
  const url = isB2BId(bookingId)
    ? `${API_BASE_URL}/api/admin/b2b/bookings`
    : `${API_BASE_URL}/api/admin/bookings`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ bookingId, status }),
  });
  if (!res.ok) {
    // Remonter le message du serveur (ex. « Photos avant insuffisantes (0/5) »).
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erreur ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

export const fetchBookingPhotos = async (bookingId: string): Promise<BookingPhoto[]> => {
  const base = isB2BId(bookingId)
    ? `${API_BASE_URL}/api/b2b/booking-photos`
    : `${API_BASE_URL}/api/bookings/photos`;
  const res = await fetch(`${base}?bookingId=${bookingId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  const data = await res.json();
  // API renvoie { success: true, photos: [...] }
  return data.photos || data;
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
  const endpoint = isB2BId(bookingId)
    ? `${API_BASE_URL}/api/b2b/booking-photos`
    : `${API_BASE_URL}/api/bookings/photos`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, url, type }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
  return res.json();
};
