import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Share,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Location } from '../types';
import { Colors, Shadows } from '../constants/theme';

interface LiveMapProps {
  destination: Location;
  userLocation: Location | null;
}

const LiveMap: React.FC<LiveMapProps> = ({ destination, userLocation }) => {
  const lat = Number(destination.latitude) || 0;
  const lng = Number(destination.longitude) || 0;

  const handleShare = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    try {
      await Share.share({
        message: `Destination: ${destination.address}\n${url}`,
        url: url,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const openInMaps = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${lat},${lng}`;
    const label = destination.address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const initialRegion = {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{
            latitude: lat,
            longitude: lng,
          }}
          title={destination.address}
        >
          <View style={styles.destinationMarker}>
            <Ionicons name="car" size={18} color={Colors.white} />
          </View>
        </Marker>

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Ma position"
          >
            <View style={styles.userMarker} />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  destinationMarker: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  userMarker: {
    backgroundColor: Colors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: Colors.white,
    ...Shadows.glow,
  },
  shareButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default LiveMap;
