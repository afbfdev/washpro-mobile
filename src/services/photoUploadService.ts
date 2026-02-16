import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

/**
 * Compresse et redimensionne une image pour accélérer l'upload.
 * Réduit à 800px de large max et compresse en JPEG 70%.
 */
const compressImage = async (uri: string): Promise<string> => {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 800 });
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
};

/**
 * Upload une image locale vers le backend (Vercel Blob)
 * et retourne l'URL publique.
 */
export const uploadImage = async (localUri: string): Promise<string> => {
  // Compresser l'image avant l'upload
  const compressedUri = await compressImage(localUri);

  // Lire le fichier compressé en base64
  const base64 = await readAsStringAsync(compressedUri, {
    encoding: EncodingType.Base64,
  });

  const filename = `photo_${Date.now()}.jpg`;

  // Envoyer au backend
  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({
      image: base64,
      filename,
      contentType: 'image/jpeg',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur upload: ${res.status}`);
  }

  const data = await res.json();
  return data.url;
};
