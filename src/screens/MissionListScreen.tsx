import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMissionStore } from '../store/missionStore';
import { useAuthStore } from '../store/authStore';
import { Booking, RootStackParamList } from '../types';
import MissionCard from '../components/MissionCard';
import { Colors, Fonts, BorderRadius } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EmptyVideo: React.FC = () => {
  const player = useVideoPlayer(require('../../assets/isthere.mp4'), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={styles.emptyVideo}
      contentFit="contain"
      nativeControls={false}
    />
  );
};

const MissionListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { bookings, fetchBookings, isLoading, unreadCount, markAllAsRead } = useMissionStore();
  const { technician } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const loadData = useCallback(() => {
    if (technician?.id) {
      fetchBookings(technician.id);
    }
  }, [technician?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeMissions = bookings.filter(
    (b) => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
  );

  const recentMissions = [...bookings]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 20);

  const handleMissionPress = (bookingId: string) => {
    navigation.navigate('MissionDetail', { missionId: bookingId });
  };

  const handleOpenNotifications = () => {
    markAllAsRead();
    setShowNotifications(true);
  };

  const handleNotificationMissionPress = (bookingId: string) => {
    setShowNotifications(false);
    setTimeout(() => navigation.navigate('MissionDetail', { missionId: bookingId }), 200);
  };

  const getStatusLabel = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING': return { label: 'En attente', color: Colors.warning };
      case 'CONFIRMED': return { label: 'Confirmée', color: Colors.primary };
      case 'IN_PROGRESS': return { label: 'En cours', color: Colors.secondary };
      case 'COMPLETED': return { label: 'Terminée', color: Colors.success };
      default: return { label: booking.status, color: Colors.textMuted };
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.titleIndicator} />
            <Text style={styles.title}>Missions du jour</Text>
          </View>
          {technician && (
            <Text style={styles.techName}>{technician.fullName}</Text>
          )}
        </View>

        {/* Bell Icon */}
        <TouchableOpacity style={styles.bellButton} onPress={handleOpenNotifications}>
          <Ionicons
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={26}
            color={Colors.primary}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Missions List */}
      {activeMissions.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <EmptyVideo />
          <Text style={styles.emptyTitle}>Vous êtes à jour !</Text>
          <Text style={styles.emptySubtitle}>
            En attente de nouvelles missions...
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeMissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MissionCard
              booking={item}
              onPress={() => handleMissionPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadData}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="notifications" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>Missions reçues</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Missions List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {recentMissions.length === 0 ? (
                <View style={styles.emptyNotif}>
                  <Ionicons name="notifications-off-outline" size={40} color={Colors.textLight} />
                  <Text style={styles.emptyNotifText}>Aucune mission reçue</Text>
                </View>
              ) : (
                recentMissions.map((booking) => {
                  const { label, color } = getStatusLabel(booking);
                  return (
                    <TouchableOpacity
                      key={booking.id}
                      style={styles.notifItem}
                      onPress={() => handleNotificationMissionPress(booking.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.notifDot, { backgroundColor: color }]} />
                      <View style={styles.notifContent}>
                        <Text style={styles.notifName}>{booking.fullName}</Text>
                        <Text style={styles.notifAddress} numberOfLines={1}>
                          {booking.address}
                        </Text>
                        <View style={styles.notifMeta}>
                          <View style={[styles.notifStatusBadge, { backgroundColor: color + '20' }]}>
                            <Text style={[styles.notifStatusText, { color }]}>{label}</Text>
                          </View>
                          <Text style={styles.notifTime}>{booking.time} · {booking.amount} MAD</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIndicator: {
    width: 4,
    height: 24,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  techName: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 12,
  },
  bellButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyVideo: {
    width: 220,
    height: 220,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 4,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  emptyNotif: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyNotifText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 12,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notifDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifName: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  notifAddress: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notifMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  notifStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  notifStatusText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  notifTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
});

export default MissionListScreen;
