import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { Colors, Fonts, BorderRadius, Shadows } from '../constants/theme';

interface MissionCardProps {
  booking: Booking;
  onPress: () => void;
}

import { SERVICE_LABELS } from '../constants/appConstants';

const MissionCard: React.FC<MissionCardProps> = ({ booking, onPress }) => {
  const serviceName = SERVICE_LABELS[booking.serviceTier] || booking.serviceTier;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftBar} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.clientName}>{booking.fullName}</Text>
            <View style={styles.carInfo}>
              <Ionicons name="car-outline" size={14} color={Colors.textLight} />
              <Text style={styles.carText}>
                {[booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Véhicule'}
              </Text>
            </View>
            {booking.phone ? (
              <TouchableOpacity
                style={styles.phoneRow}
                onPress={() => Linking.openURL(`tel:${booking.phone}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="call-outline" size={13} color={Colors.primary} />
                <Text style={styles.phoneText}>{booking.phone}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{booking.time}</Text>
            </View>
            {booking.date ? (
              <Text style={styles.dateText}>
                {booking.date.split('-').reverse().join('/')}
              </Text>
            ) : null}
            {booking.status === 'IN_PROGRESS' && (
              <View style={styles.inProgressBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.inProgressText}>EN COURS</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={Colors.textLight} />
          <Text style={styles.locationText} numberOfLines={1}>
            {booking.address}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceText}>{serviceName}</Text>
          </View>
          <Text style={styles.amountText}>{booking.amount} MAD</Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.soft,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  leftBar: {
    width: 6,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  clientName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  carText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.primary,
    marginLeft: 4,
  },
  timeBadge: {
    backgroundColor: Colors.infoLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  dateText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'right',
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginRight: 4,
  },
  inProgressText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginTop: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  serviceBadge: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  serviceText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MissionCard;
