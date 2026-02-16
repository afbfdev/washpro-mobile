import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  Linking,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useMissionStore } from '../store/missionStore';
import { RootStackParamList, Location } from '../types';
import { uploadBookingPhoto } from '../services/apiService';
import { uploadImage } from '../services/photoUploadService';
import PhotoUploader from '../components/PhotoUploader';
import LiveMap from '../components/LiveMap';
import {
  requestLocationPermission,
  watchLocation,
  calculateDistance,
} from '../services/locationService';
import * as ExpoLocation from 'expo-location';
import { Colors, Fonts, BorderRadius, Shadows } from '../constants/theme';

type MissionDetailRouteProp = RouteProp<RootStackParamList, 'MissionDetail'>;

import { SERVICE_LABELS } from '../constants/appConstants';

const MissionDetailScreen: React.FC = () => {
  const route = useRoute<MissionDetailRouteProp>();
  const navigation = useNavigation();
  const { getBookingById, startBooking, completeBooking } = useMissionStore();

  const booking = getBookingById(route.params.missionId);

  const [step, setStep] = useState(0);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState<string>('...');
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photosBefore, setPhotosBefore] = useState<string[]>([]);
  const [photosAfter, setPhotosAfter] = useState<string[]>([]);

  useEffect(() => {
    if (!booking) return;

    if (booking.status === 'COMPLETED') {
      setStep(3);
    } else if (booking.status === 'IN_PROGRESS') {
      setStep(2);
    }

    // Load existing photos
    if (booking.photos) {
      const before = booking.photos
        .filter((p) => p.type === 'BEFORE')
        .map((p) => p.url);
      const after = booking.photos
        .filter((p) => p.type === 'AFTER')
        .map((p) => p.url);
      setPhotosBefore(before);
      setPhotosAfter(after);
    }
  }, [booking?.id]);

  useEffect(() => {
    let subscription: ExpoLocation.LocationSubscription | null = null;

    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission GPS requise',
          'Activez la localisation pour voir la distance.'
        );
        return;
      }

      subscription = await watchLocation((loc) => {
        setUserLocation(loc);
        if (
          booking &&
          booking.latitude != null &&
          booking.longitude != null &&
          booking.latitude !== 0 &&
          booking.longitude !== 0
        ) {
          const dist = calculateDistance(
            loc.latitude,
            loc.longitude,
            booking.latitude,
            booking.longitude
          );
          setDistance(dist);
        }
      });
    };

    if (step === 0 && booking) {
      startTracking();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [step, booking?.id]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Mission non trouvée</Text>
      </SafeAreaView>
    );
  }

  const hasValidCoords =
    booking.latitude != null &&
    booking.longitude != null &&
    booking.latitude !== 0 &&
    booking.longitude !== 0;

  const destination: Location = {
    latitude: hasValidCoords ? booking.latitude! : 33.5731,
    longitude: hasValidCoords ? booking.longitude! : -7.5898,
    address: booking.address,
  };

  const handleStartMission = async () => {
    try {
      await startBooking(booking.id);
      setStep(2);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la mission.');
    }
  };

  const handleFinish = async () => {
    try {
      await completeBooking(booking.id);
      setShowFinishModal(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de terminer la mission.');
    }
  };

  const handlePhotoTaken = (
    uri: string,
    index: number,
    type: 'BEFORE' | 'AFTER'
  ) => {
    // Immediately show the local photo
    if (type === 'BEFORE') {
      setPhotosBefore((prev) => {
        const updated = [...prev];
        updated[index] = uri;
        return updated;
      });
    } else {
      setPhotosAfter((prev) => {
        const updated = [...prev];
        updated[index] = uri;
        return updated;
      });
    }

    // Upload en arrière-plan (non-bloquant)
    setUploadingCount((c) => c + 1);
    uploadImage(uri)
      .then((photoUrl) => uploadBookingPhoto(booking.id, photoUrl, type))
      .catch((error: any) => {
        console.error('Photo upload failed:', error);
        Alert.alert(
          'Erreur upload',
          error.message || "La photo n'a pas pu être envoyée."
        );
      })
      .finally(() => {
        setUploadingCount((c) => c - 1);
      });
  };

  const getStepTitle = () => {
    switch (step) {
      case 0:
        return 'En route vers le client';
      case 1:
        return 'Photos avant lavage';
      case 2:
        return 'Photos après lavage';
      case 3:
        return 'Mission Terminée';
      default:
        return '';
    }
  };

  const allBeforePhotosTaken = photosBefore.filter(Boolean).length >= 5;
  const allAfterPhotosTaken = photosAfter.filter(Boolean).length >= 5;

  const openGoogleMaps = () => {
    const url = `https://maps.google.com/?q=${booking.address}`;
    Linking.openURL(url);
  };

  const serviceName = SERVICE_LABELS[booking.serviceTier] || booking.serviceTier;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{booking.fullName}</Text>
          <View style={styles.headerSubtitleRow}>
            <Ionicons name="car" size={12} color={Colors.secondary} />
            <Text style={styles.headerSubtitle}>
              {[booking.vehicleBrand, booking.vehicleModel].filter(Boolean).join(' ') || 'Véhicule'}
            </Text>
          </View>
        </View>
        {step === 0 && (
          <View style={styles.distanceBox}>
            <Text style={styles.distanceLabel}>DISTANCE</Text>
            <Text style={styles.distanceValue}>{distance}</Text>
          </View>
        )}
      </View>

      {/* Upload indicator */}
      {uploadingCount > 0 && (
        <View style={styles.uploadBanner}>
          <ActivityIndicator size="small" color={Colors.white} />
          <Text style={styles.uploadText}>
            Upload {uploadingCount > 1 ? `${uploadingCount} photos` : 'photo'} en cours...
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Step 0: Map */}
        {step === 0 && (
          <View style={styles.mapContainer}>
            <LiveMap destination={destination} userLocation={userLocation} />
            <View style={styles.destinationCard}>
              <View style={styles.destinationIcon}>
                <Ionicons name="navigate" size={24} color={Colors.primary} />
              </View>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationLabel}>DESTINATION</Text>
                <Text style={styles.destinationAddress}>
                  {booking.address}
                </Text>
                <TouchableOpacity onPress={openGoogleMaps}>
                  <Text style={styles.mapsLink}>Ouvrir dans Google Maps</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Steps 1-4 */}
        {step > 0 && (
          <View style={styles.stepContent}>
            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoAddress}>{booking.address}</Text>
                  {step !== 3 && (
                    <View style={styles.gpsStatus}>
                      <View style={styles.gpsDot} />
                      <Text style={styles.gpsText}>GPS Actif</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.serviceRow}>
                <Text style={styles.serviceType}>{serviceName}</Text>
                <Text style={styles.scheduledTime}>{booking.time}</Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Montant</Text>
                <Text style={styles.amountValue}>{booking.amount} MAD</Text>
              </View>
              {booking.comments && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>
                    <Text style={styles.noteBold}>Note: </Text>
                    {booking.comments}
                  </Text>
                </View>
              )}
            </View>

            {/* Existing Photos */}
            {(photosBefore.length > 0 || photosAfter.length > 0) && step === 3 && (
              <View style={styles.existingPhotos}>
                {photosBefore.length > 0 && (
                  <View style={styles.photoSection}>
                    <Text style={styles.photoSectionTitle}>
                      Photos Avant Lavage ({photosBefore.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {photosBefore.map((uri, i) => (
                        <Image
                          key={i}
                          source={{ uri }}
                          style={styles.photoThumbnail}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
                {photosAfter.length > 0 && (
                  <View style={styles.photoSection}>
                    <Text style={styles.photoSectionTitle}>
                      Photos Après Lavage ({photosAfter.length})
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {photosAfter.map((uri, i) => (
                        <Image
                          key={i}
                          source={{ uri }}
                          style={styles.photoThumbnail}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Active Steps */}
            {step < 3 && (
              <View style={styles.activeStep}>
                <Text style={styles.stepTitle}>{getStepTitle()}</Text>

                {step === 1 && (
                  <View>
                    <Text style={styles.stepDescription}>
                      Prenez les 5 photos du véhicule avant de commencer le lavage.
                    </Text>
                    <View style={styles.photoCounter}>
                      <Ionicons
                        name="camera"
                        size={16}
                        color={allBeforePhotosTaken ? Colors.success : Colors.textMuted}
                      />
                      <Text style={[
                        styles.photoCounterText,
                        allBeforePhotosTaken && { color: Colors.success },
                      ]}>
                        {photosBefore.filter(Boolean).length}/5 photos
                      </Text>
                    </View>
                    {[
                      '1. Face Avant',
                      '2. Face Arrière',
                      '3. Côté Conducteur',
                      '4. Côté Passager',
                      '5. Intérieur',
                    ].map((label, i) => (
                      <PhotoUploader
                        key={i}
                        label={label}
                        initialPhoto={photosBefore[i]}
                        onPhotoTaken={(uri) => handlePhotoTaken(uri, i, 'BEFORE')}
                      />
                    ))}
                  </View>
                )}

                {step === 2 && (
                  <View>
                    <Text style={styles.stepDescription}>
                      Prenez les 5 photos du résultat final pour validation.
                    </Text>
                    <View style={styles.photoCounter}>
                      <Ionicons
                        name="camera"
                        size={16}
                        color={allAfterPhotosTaken ? Colors.success : Colors.textMuted}
                      />
                      <Text style={[
                        styles.photoCounterText,
                        allAfterPhotosTaken && { color: Colors.success },
                      ]}>
                        {photosAfter.filter(Boolean).length}/5 photos
                      </Text>
                    </View>
                    {[
                      '1. Face Avant (Propre)',
                      '2. Face Arrière (Propre)',
                      '3. Côté Conducteur (Propre)',
                      '4. Côté Passager (Propre)',
                      '5. Intérieur (Propre)',
                    ].map((label, i) => (
                      <PhotoUploader
                        key={i}
                        label={label}
                        initialPhoto={photosAfter[i]}
                        onPhotoTaken={(uri) => handlePhotoTaken(uri, i, 'AFTER')}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Completed */}
            {step === 3 && (
              <View style={styles.completedView}>
                <View style={styles.completedIcon}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                </View>
                <Text style={styles.completedTitle}>Mission Terminée</Text>
                <Text style={styles.completedSubtitle}>
                  Le rapport a été envoyé au dashboard.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      {step < 3 && (
        <View style={styles.footer}>
          {step === 0 && (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(1)}>
              <Text style={styles.primaryButtonText}>Étape Suivante</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {step === 1 && (
            <TouchableOpacity
              style={[styles.primaryButton, !allBeforePhotosTaken && styles.disabledButton]}
              onPress={handleStartMission}
              disabled={!allBeforePhotosTaken}
            >
              <Text style={[styles.primaryButtonText, !allBeforePhotosTaken && styles.disabledButtonText]}>
                Démarrer la mission
              </Text>
              <Ionicons name="play-circle" size={20} color={allBeforePhotosTaken ? Colors.primary : Colors.textLight} />
            </TouchableOpacity>
          )}
          {step === 2 && (
            <TouchableOpacity
              style={[styles.primaryButton, styles.finishButton, !allAfterPhotosTaken && styles.disabledButton]}
              onPress={() => setShowFinishModal(true)}
              disabled={!allAfterPhotosTaken}
            >
              <Text style={[styles.primaryButtonText, styles.finishButtonText, !allAfterPhotosTaken && styles.disabledButtonText]}>
                Terminer la mission
              </Text>
              <Ionicons name="checkmark-circle" size={20} color={allAfterPhotosTaken ? Colors.white : Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal visible={showFinishModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmation</Text>
            <Text style={styles.modalMessage}>
              Êtes-vous sûr de vouloir terminer cette mission ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowFinishModal(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleFinish}
              >
                <Text style={styles.modalConfirmText}>Oui</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.secondary,
    marginLeft: 4,
  },
  distanceBox: {
    alignItems: 'flex-end',
  },
  distanceLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.secondary,
  },
  distanceValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  uploadBanner: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  uploadText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.medium,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  mapContainer: {
    flex: 1,
    height: 400,
    position: 'relative',
  },
  destinationCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 16,
    flexDirection: 'row',
    ...Shadows.card,
  },
  destinationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  destinationLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  destinationAddress: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  mapsLink: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.secondary,
    textDecorationLine: 'underline',
    marginTop: 8,
  },
  stepContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  infoAddress: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  gpsText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.success,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  serviceType: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  scheduledTime: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.textPrimary,
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  amountLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
  },
  amountValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  noteBox: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    padding: 8,
    marginTop: 12,
  },
  noteText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#854d0e',
  },
  noteBold: {
    fontFamily: Fonts.bold,
  },
  existingPhotos: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  photoSection: {
    marginTop: 16,
  },
  photoSectionTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.sm,
    marginRight: 8,
  },
  activeStep: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  stepDescription: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  photoCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoCounterText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  disabledButton: {
    backgroundColor: Colors.backgroundMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: Colors.textLight,
  },
  completedView: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
  },
  completedSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  primaryButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.glow,
  },
  finishButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
    marginRight: 8,
  },
  finishButtonText: {
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.backgroundMuted,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
});

export default MissionDetailScreen;
