import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Booking } from '../types';
import { SERVICE_LABELS } from '../constants/appConstants';
import { savePushToken } from './apiService';

export const BACKGROUND_FETCH_TASK = 'background-booking-fetch';

const AUTH_STORAGE_KEY = 'washpro_auth';
const KNOWN_IDS_KEY = 'washpro_known_ids';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

// Afficher les notifications même quand l'app est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Tâche de fond — s'exécute même quand l'app est fermée
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return BackgroundFetch.BackgroundFetchResult.NoData;

    const technician = JSON.parse(stored);
    if (!technician?.id) return BackgroundFetch.BackgroundFetchResult.NoData;

    const res = await fetch(`${API_BASE_URL}/api/admin/bookings`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Password': ADMIN_PASSWORD,
      },
    });
    if (!res.ok) return BackgroundFetch.BackgroundFetchResult.Failed;

    const data = await res.json();
    const bookings = (data.bookings || []).filter(
      (b: any) =>
        b.technicianId === technician.id &&
        ['PENDING', 'CONFIRMED'].includes(b.status)
    );

    const storedIdsStr = await AsyncStorage.getItem(KNOWN_IDS_KEY);
    const knownIds: string[] = storedIdsStr ? JSON.parse(storedIdsStr) : [];

    const newBookings = bookings.filter((b: any) => !knownIds.includes(b.id));

    for (const booking of newBookings) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Nouvelle mission assignée',
          body: `${booking.fullName} · ${booking.time}\n${booking.address}`,
          sound: 'default',
          data: { bookingId: booking.id },
        },
        trigger: null,
      });
    }

    const allIds = bookings.map((b: any) => b.id);
    await AsyncStorage.setItem(
      KNOWN_IDS_KEY,
      JSON.stringify([...new Set([...knownIds, ...allIds])])
    );

    return newBookings.length > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (err) {
    console.error('Background fetch error:', err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const registerPushToken = async (technicianId: string): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '9a4bd93c-6e1d-46cb-b7e3-1753a987a4ce',
    });
    await savePushToken(technicianId, tokenData.data);
  } catch (error) {
    console.error('Push token registration failed:', error);
  }
};

export const sendNewBookingNotification = async (booking: Booking) => {
  const service = SERVICE_LABELS[booking.serviceTier] || booking.serviceTier;
  const vehicle =
    [booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Véhicule';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Nouvelle mission assignée',
      body: `${booking.fullName} - ${service}\n${vehicle} • ${booking.time}\n${booking.address}`,
      sound: 'default',
      data: { bookingId: booking.id },
    },
    trigger: null,
  });
};

export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('new-bookings', {
      name: 'Nouvelles missions',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableLights: true,
      lightColor: '#F1C40F',
      enableVibrate: true,
      showBadge: true,
    });
  }
};

export const registerBackgroundFetch = async (): Promise<void> => {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60,    // 1 min (iOS force 15 min minimum en pratique)
        stopOnTerminate: false, // Continue même si app fermée
        startOnBoot: true,      // Redémarre après redémarrage du téléphone
      });
    }
  } catch (error) {
    console.error('Background fetch registration failed:', error);
  }
};
