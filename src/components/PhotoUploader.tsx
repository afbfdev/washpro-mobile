import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, BorderRadius } from '../constants/theme';

interface PhotoUploaderProps {
  label: string;
  onPhotoTaken: (uri: string) => void;
  initialPhoto?: string;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  label,
  onPhotoTaken,
  initialPhoto,
}) => {
  const [preview, setPreview] = useState<string | null>(initialPhoto || null);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
      onPhotoTaken(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
      onPhotoTaken(result.assets[0].uri);
    }
  };

  const handlePress = () => {
    Alert.alert('Ajouter une photo', 'Choisissez une option', [
      { text: 'Prendre une photo', onPress: pickFromCamera },
      { text: 'Choisir depuis la galerie', onPress: pickFromGallery },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const resetPhoto = () => setPreview(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.uploadArea} onPress={handlePress}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.iconRow}>
              <Ionicons name="camera" size={28} color={Colors.textLight} />
              <View style={styles.iconSeparator} />
              <Ionicons name="image-outline" size={28} color={Colors.textLight} />
            </View>
            <Text style={styles.placeholderText}>
              Appuyer pour prendre ou choisir une photo
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {preview && (
        <TouchableOpacity onPress={resetPhoto}>
          <Text style={styles.resetButton}>Reprendre</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  uploadArea: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.backgroundMuted,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconSeparator: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 4,
  },
  resetButton: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: Colors.error,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});

export default PhotoUploader;
