import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://wash.zeroeau.com';
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || '';
const BLOB_API_URL = 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';

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
 * Upload une image locale directement vers Vercel Blob (sans passer par la Vercel Function).
 * Étape 1 : obtenir un token signé depuis le backend.
 * Étape 2 : envoyer le binaire directement à Vercel Blob.
 */
export const uploadImage = async (localUri: string): Promise<string> => {
  const compressedUri = await compressImage(localUri);
  const filename = `photo_${Date.now()}.jpg`;
  const pathname = `washpro/${filename}`;

  // Étape 1 : Obtenir le token client depuis le backend
  const tokenRes = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Password': ADMIN_PASSWORD,
    },
    body: JSON.stringify({ pathname }),
  });

  if (!tokenRes.ok) {
    const errorData = await tokenRes.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur token: ${tokenRes.status}`);
  }

  const tokenData = await tokenRes.json();
  const clientToken: string = tokenData.clientToken;

  if (!clientToken) {
    throw new Error('Token client non reçu du serveur');
  }

  // Étape 2 : Upload binaire direct vers Vercel Blob (bypass Vercel Function)
  const uploadUrl = `${BLOB_API_URL}/?pathname=${encodeURIComponent(pathname)}`;

  const uploadResult = await uploadAsync(uploadUrl, compressedUri, {
    httpMethod: 'PUT',
    headers: {
      'authorization': `Bearer ${clientToken}`,
      'x-api-version': BLOB_API_VERSION,
      'content-type': 'image/jpeg',
    },
    uploadType: FileSystemUploadType.BINARY_CONTENT,
  });

  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Erreur upload Vercel Blob: ${uploadResult.status} - ${uploadResult.body}`);
  }

  const blobData = JSON.parse(uploadResult.body);

  if (!blobData.url) {
    throw new Error('URL manquante dans la réponse Vercel Blob');
  }

  return blobData.url;
};
