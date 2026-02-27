import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMissionStore } from '../store/missionStore';
import { RootStackParamList, Booking } from '../types';
import { Colors, Fonts, BorderRadius, Shadows } from '../constants/theme';
import { SERVICE_LABELS } from '../constants/appConstants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'today', label: "Aujourd'hui" },
  { key: 'week', label: 'Cette semaine' },
  { key: 'month', label: 'Ce mois' },
];

const isInPeriod = (booking: Booking, period: FilterPeriod): boolean => {
  if (period === 'all') return true;
  const bookingDate = new Date(booking.date);
  const now = new Date();

  if (period === 'today') {
    return (
      bookingDate.getFullYear() === now.getFullYear() &&
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getDate() === now.getDate()
    );
  }
  if (period === 'week') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return bookingDate >= startOfWeek;
  }
  if (period === 'month') {
    return (
      bookingDate.getFullYear() === now.getFullYear() &&
      bookingDate.getMonth() === now.getMonth()
    );
  }
  return true;
};

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i < score ? 'star' : 'star-outline'}
        size={14}
        color={i < score ? Colors.secondary : Colors.textLight}
      />
    );
  }
  return <View style={styles.scoreBadge}>{stars}</View>;
};

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { bookings } = useMissionStore();
  const [activeFilter, setActiveFilter] = useState<FilterPeriod>('all');

  const historyBookings = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          (b.status === 'COMPLETED' || b.status === 'CANCELLED') &&
          isInPeriod(b, activeFilter)
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings, activeFilter]);

  const completedCount = historyBookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = historyBookings.filter((b) => b.status === 'CANCELLED').length;

  const handleMissionPress = (bookingId: string) => {
    navigation.navigate('MissionDetail', { missionId: bookingId });
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const photoCount = item.photos?.length || 0;
    const serviceName = SERVICE_LABELS[item.serviceTier] || item.serviceTier;
    const score = item.validation?.score ?? 0;
    const isCancelled = item.status === 'CANCELLED';

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => handleMissionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcon, isCancelled && styles.cardIconCancelled]}>
          <Ionicons
            name={isCancelled ? 'close-circle' : 'checkmark-circle'}
            size={24}
            color={isCancelled ? Colors.error : Colors.success}
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{item.fullName}</Text>
          <View style={styles.carInfo}>
            <Ionicons name="car-outline" size={14} color={Colors.textLight} />
            <Text style={styles.carText}>
              {[item.vehicleBrand, item.vehicleModel].filter(Boolean).join(' ') || 'Véhicule'}
            </Text>
          </View>
          <Text style={styles.serviceType}>{serviceName}</Text>
          {!isCancelled && score > 0 && <ScoreBadge score={score} />}
          {isCancelled && (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledText}>Annulée</Text>
            </View>
          )}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.dateText}>{item.date}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={[styles.amountText, isCancelled && styles.amountCancelled]}>
            {item.amount} MAD
          </Text>
          {!isCancelled && photoCount > 0 && (
            <View style={styles.photoBadge}>
              <Ionicons name="images-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.photoCount}>{photoCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.title}>Historique</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            <Text style={styles.statCount}>{completedCount}</Text> terminée(s)
          </Text>
          {cancelledCount > 0 && (
            <Text style={[styles.statItem, { marginLeft: 12 }]}>
              <Text style={[styles.statCount, { color: Colors.error }]}>{cancelledCount}</Text> annulée(s)
            </Text>
          )}
        </View>
      </View>

      {/* Filtres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, activeFilter === f.key && styles.chipActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Liste */}
      {historyBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Aucune mission</Text>
          <Text style={styles.emptySubtitle}>
            Aucune mission pour cette période
          </Text>
        </View>
      ) : (
        <FlatList
          data={historyBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 4,
    marginLeft: 12,
  },
  statItem: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  statCount: {
    fontFamily: Fonts.bold,
    color: Colors.success,
  },
  // Filtres
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  // Liste
  listContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 16,
    marginTop: 32,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
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
    textAlign: 'center',
  },
  // Card
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.soft,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconCancelled: {
    backgroundColor: Colors.errorLight,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  carText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  serviceType: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreBadge: {
    flexDirection: 'row',
    marginTop: 4,
  },
  cancelledBadge: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  cancelledText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: Colors.error,
  },
  cardMeta: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  amountText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  amountCancelled: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  photoCount: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginLeft: 4,
  },
});

export default HistoryScreen;
