import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useMissionStore } from '../store/missionStore';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../types';
import MissionCard from '../components/MissionCard';
import { Colors, Fonts, BorderRadius } from '../constants/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MissionListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { bookings, fetchBookings, isLoading } = useMissionStore();
  const { technician } = useAuthStore();

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

  const handleMissionPress = (bookingId: string) => {
    navigation.navigate('MissionDetail', { missionId: bookingId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.title}>Missions du jour</Text>
        </View>
        {technician && (
          <Text style={styles.techName}>{technician.fullName}</Text>
        )}
      </View>

      {activeMissions.length === 0 && !isLoading ? (
        <View style={styles.emptyState}>
          <Ionicons name="sparkles" size={48} color={Colors.textLight} />
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
  techName: {
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
  },
});

export default MissionListScreen;
