import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus } from '../types';
import * as api from '../services/apiService';

interface MissionStore {
  bookings: Booking[];
  knownBookingIds: Set<string>;
  unreadCount: number;
  isLoading: boolean;
  isOffline: boolean;
  lastSync: string | null;
  setOffline: (offline: boolean) => void;
  fetchBookings: (technicianId?: string) => Promise<Booking[]>;
  markAllAsRead: () => void;
  startBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  getBookingById: (id: string) => Booking | undefined;
}

const STORAGE_KEY = 'washpro_bookings';
const KNOWN_IDS_KEY = 'washpro_known_ids';
const UNREAD_COUNT_KEY = 'washpro_unread_count';

export const useMissionStore = create<MissionStore>((set, get) => ({
  bookings: [],
  knownBookingIds: new Set<string>(),
  unreadCount: 0,
  isLoading: true,
  isOffline: false,
  lastSync: null,

  setOffline: (offline: boolean) => set({ isOffline: offline }),

  markAllAsRead: () => {
    AsyncStorage.setItem(UNREAD_COUNT_KEY, '0');
    set({ unreadCount: 0 });
  },

  fetchBookings: async (technicianId?: string) => {
    set({ isLoading: true });
    try {
      const allBookings = await api.fetchBookings();
      const filtered = technicianId
        ? allBookings.filter((b) => b.technicianId === technicianId)
        : allBookings;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      // Charger les IDs connus persistés si le store est vide (ex: redémarrage de l'app)
      let { knownBookingIds } = get();
      if (knownBookingIds.size === 0) {
        try {
          const storedIds = await AsyncStorage.getItem(KNOWN_IDS_KEY);
          if (storedIds) {
            knownBookingIds = new Set(JSON.parse(storedIds));
            set({ knownBookingIds });
          }
        } catch {}
      }

      // Charger le unreadCount persisté
      if (get().unreadCount === 0) {
        try {
          const storedCount = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
          if (storedCount) set({ unreadCount: parseInt(storedCount, 10) });
        } catch {}
      }

      // Détecter les nouvelles réservations
      const newBookings = knownBookingIds.size > 0
        ? filtered.filter((b) => !knownBookingIds.has(b.id))
        : [];
      const updatedIds = new Set(filtered.map((b) => b.id));

      // Persister les IDs connus
      await AsyncStorage.setItem(KNOWN_IDS_KEY, JSON.stringify([...updatedIds]));

      const newUnreadCount = get().unreadCount + newBookings.length;
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, String(newUnreadCount));

      set((state) => ({
        bookings: filtered,
        knownBookingIds: updatedIds,
        unreadCount: newUnreadCount,
        isLoading: false,
        lastSync: new Date().toISOString(),
        isOffline: false,
      }));

      return newBookings;
    } catch (error) {
      console.error('Failed to fetch bookings from API:', error);
      // Offline fallback: load from cache
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          set({ bookings: JSON.parse(stored), isLoading: false, isOffline: true });
        } else {
          set({ bookings: [], isLoading: false, isOffline: true });
        }
      } catch {
        set({ bookings: [], isLoading: false, isOffline: true });
      }
      return [];
    }
  },

  startBooking: async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'IN_PROGRESS');
      const { bookings } = get();
      const updated = bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'IN_PROGRESS' as BookingStatus, startedAt: new Date().toISOString() }
          : b
      );
      set({ bookings: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to start booking:', error);
      throw error;
    }
  },

  completeBooking: async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'COMPLETED');
      const { bookings } = get();
      const updated = bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'COMPLETED' as BookingStatus, completedAt: new Date().toISOString() }
          : b
      );
      set({ bookings: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to complete booking:', error);
      throw error;
    }
  },

  getBookingById: (id: string) => {
    return get().bookings.find((b) => b.id === id);
  },
}));
