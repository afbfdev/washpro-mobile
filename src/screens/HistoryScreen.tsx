import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMissionStore } from '../store/missionStore';
import { RootStackParamList, Booking } from '../types';
import { Colors, Fonts, BorderRadius, Shadows } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SERVICE_LABELS: Record<string, string> = {
  express: 'Express',
  brillance: 'Brillance',
  gold: 'Gold',
  royale: 'Royale',
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

  const completedBookings = bookings.filter(
    (b) => b.status === 'COMPLETED'
  );

  const handleMissionPress = (bookingId: string) => {
    navigation.navigate('MissionDetail', { missionId: bookingId });
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const photoCount = item.photos?.length || 0;
    const serviceName = SERVICE_LABELS[item.serviceTier] || item.serviceTier;
    const score = item.validation?.score ?? 0;

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => handleMissionPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{item.fullName}</Text>
          <View style={styles.carInfo}>
            <Ionicons name="car-outline" size={14} color={Colors.textLight} />
            <Text style={styles.carText}>
              {item.vehicleBrand} {item.vehicleModel}
            </Text>
          </View>
          <Text style={styles.serviceType}>{serviceName}</Text>
          {score > 0 && <ScoreBadge score={score} />}
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.amountText}>{item.amount} MAD</Text>
          {photoCount > 0 && (
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.title}>Historique</Text>
        </View>
        <Text style={styles.subtitle}>
          {completedBookings.length} mission(s) terminée(s)
        </Text>
      </View>

      {completedBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Aucune mission terminée</Text>
          <Text style={styles.emptySubtitle}>
            Vos missions complétées apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={completedBookings}
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
  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 12,
  },
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
  cardMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textSecondary,
  },
  amountText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginTop: 2,
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
