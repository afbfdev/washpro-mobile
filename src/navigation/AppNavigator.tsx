import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

import { RootStackParamList, TabParamList } from '../types';
import { useMissionStore } from '../store/missionStore';
import { useAuthStore } from '../store/authStore';
import { Colors, Fonts } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  requestNotificationPermissions,
  setupNotificationChannel,
  sendNewBookingNotification,
  registerPushToken,
} from '../services/notificationService';

import LoginScreen from '../screens/LoginScreen';
import MissionListScreen from '../screens/MissionListScreen';
import MissionDetailScreen from '../screens/MissionDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const OfflineBanner = () => {
  const { isOffline } = useMissionStore();

  if (!isOffline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Ionicons name="cloud-offline" size={14} color={Colors.white} />
      <Text style={styles.offlineText}>
        Mode Hors Ligne - Données sauvegardées localement
      </Text>
    </View>
  );
};

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Missions':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'History':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 65 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Fonts.medium,
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Missions"
        component={MissionListScreen}
        options={{ tabBarLabel: 'Missions' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Historique' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </Tab.Navigator>
  );
};

const POLLING_INTERVAL = 30_000; // 30 secondes

const AppNavigator: React.FC = () => {
  const { setOffline, fetchBookings } = useMissionStore();
  const { isAuthenticated, isLoading, loadSession, technician } = useAuthStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadSession();
    setupNotificationChannel();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Polling des nouvelles réservations
  useEffect(() => {
    if (!isAuthenticated || !technician?.id) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    // Demander les permissions et enregistrer le push token
    requestNotificationPermissions();
    registerPushToken(technician.id);

    // Premier fetch
    fetchBookings(technician.id);

    const poll = async () => {
      // Ne pas poll si l'app est en arrière-plan
      if (AppState.currentState !== 'active') return;

      const netState = await NetInfo.fetch();
      if (!netState.isConnected) return;

      const newBookings = await fetchBookings(technician.id);
      for (const booking of newBookings) {
        await sendNewBookingNotification(booking);
      }
    };

    pollingRef.current = setInterval(poll, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isAuthenticated, technician?.id]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <OfflineBanner />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen
                name="MissionDetail"
                component={MissionDetailScreen}
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  offlineBanner: {
    backgroundColor: Colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  offlineText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    marginLeft: 6,
  },
});

export default AppNavigator;
