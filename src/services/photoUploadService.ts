import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';

/**
 * Upload une image locale vers le backend (Vercel Blob)
 * et retourne l'URL publique.
 */
export const uploadImage = async (localUri: string): Promise<string> => {
  // Lire le fichier en base64
  const base64 = await readAsStringAsync(localUri, {
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
