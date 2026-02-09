import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Technician } from '../types';
import { fetchTechnicians } from '../services/apiService';

const AUTH_STORAGE_KEY = 'washpro_auth';

// Normalize phone: remove spaces, convert leading 0 to +212
const normalizePhone = (phone: string): string => {
  let normalized = phone.trim().replace(/\s+/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+212' + normalized.slice(1);
  }
  return normalized;
};

interface AuthStore {
  technician: Technician | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  technician: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (phone: string) => {
    set({ isLoading: true });
    try {
      const technicians = await fetchTechnicians();
      const inputNormalized = normalizePhone(phone);

      const found = technicians.find((t) => {
        const tNorm = normalizePhone(t.phone);
        return tNorm === inputNormalized;
      });

      if (!found) {
        throw new Error('Numéro non trouvé. Vérifiez votre numéro de téléphone.');
      }

      if (!found.isActive) {
        throw new Error('Ce compte technicien est désactivé.');
      }

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      set({ technician: found, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      if (error.message?.includes('Numéro non trouvé') || error.message?.includes('désactivé')) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion.');
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    set({ technician: null, isAuthenticated: false });
  },

  loadSession: async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const technician: Technician = JSON.parse(stored);
        set({ technician, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
