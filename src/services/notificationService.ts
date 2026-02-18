import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Booking } from '../types';
import { SERVICE_LABELS } from '../constants/appConstants';

// Afficher les notifications même quand l'app est au premier plan
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Demande les permissions de notification à l'utilisateur.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

/**
 * Envoie une notification locale pour une nouvelle réservation.
 */
export const sendNewBookingNotification = async (booking: Booking) => {
  const service = SERVICE_LABELS[booking.serviceTier] || booking.serviceTier;
  const vehicle = [booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Véhicule';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nouvelle mission assignée',
      body: `${booking.fullName} - ${service}\n${vehicle} • ${booking.time}\n${booking.address}`,
      data: { bookingId: booking.id },
      sound: true,
    },
    trigger: null, // Immédiat
  });
};

/**
 * Configure le channel Android pour les notifications.
 */
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('new-bookings', {
      name: 'Nouvelles missions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }
};
