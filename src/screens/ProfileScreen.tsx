import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useMissionStore } from '../store/missionStore';
import { Colors, Fonts, BorderRadius, Shadows } from '../constants/theme';
import { ZONES } from '../constants/appConstants';

const ProfileScreen: React.FC = () => {
  const { technician, logout } = useAuthStore();
  const { bookings } = useMissionStore();

  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingCount = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS'
  ).length;

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.secondary} />
          </View>
          <Text style={styles.name}>
            {technician?.fullName || 'Technicien'}
          </Text>
          <Text style={styles.role}>{technician?.phone}</Text>
          {technician?.zone && (
            <View style={styles.zoneBadge}>
              <Ionicons name="location" size={14} color={Colors.secondary} />
              <Text style={styles.zoneText}>
                {ZONES[technician.zone]?.name || technician.zone}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.warningLight }]}>
              <Ionicons name="time" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{pendingCount}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: Colors.infoLight }]}>
              <Ionicons name="car" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Technician Info */}
        {technician && (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>Informations</Text>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="person-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>{technician.fullName}</Text>
              </View>
            </View>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="call-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>{technician.phone}</Text>
              </View>
            </View>
            {technician.email && (
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="mail-outline" size={22} color={Colors.textSecondary} />
                  <Text style={styles.menuItemText}>{technician.email}</Text>
                </View>
              </View>
            )}
            {technician.zone && (
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Ionicons name="map-outline" size={22} color={Colors.textSecondary} />
                  <Text style={styles.menuItemText}>
                    {ZONES[technician.zone]?.name || technician.zone} - {ZONES[technician.zone]?.areas || ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Settings */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Paramètres</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openSettings()}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openSettings()}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Localisation</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => Linking.openSettings()}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="camera-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Caméra</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Aide & FAQ</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Contacter le support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              <Text style={[styles.menuItemText, { color: Colors.error }]}>
                Se déconnecter
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>WashPro Mobile v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 ZeroEau</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  content: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  role: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.secondary,
    marginTop: 4,
  },
  zoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  zoneText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.secondary,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    ...Shadows.soft,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: Colors.white,
    marginTop: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  copyrightText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 4,
  },
});

export default ProfileScreen;
