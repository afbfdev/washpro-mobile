# WashPro Mobile

Application mobile React Native (Expo) pour techniciens de lavage automobile.

## Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les clés API dans .env
```

## Configuration

Modifiez le fichier `.env` avec vos clés API :

```
EXPO_PUBLIC_GEMINI_API_KEY=votre_clé_gemini
```

Pour Google Maps (Android/iOS natif), modifiez `app.json` :
- iOS : `expo.ios.config.googleMapsApiKey`
- Android : `expo.android.config.googleMaps.apiKey`

## Lancement

```bash
# Démarrer le serveur de développement
npm start

# Ou directement sur un simulateur
npm run ios
npm run android
```

## Structure du projet

```
src/
├── components/        # Composants réutilisables
│   ├── LiveMap.tsx   # Carte en temps réel
│   ├── MissionCard.tsx
│   └── PhotoUploader.tsx
├── screens/          # Écrans de l'application
│   ├── MissionListScreen.tsx
│   ├── MissionDetailScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── SmartAssistantScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/       # Configuration React Navigation
├── services/         # Services API (Gemini, Location)
├── store/           # État global (Zustand)
├── types/           # Types TypeScript
└── constants/       # Données mock
```

## Fonctionnalités

- Gestion des missions de lavage
- Workflow multi-étapes
- Capture de photos avant/après
- GPS et navigation en temps réel
- Assistant IA (Google Gemini)
- Mode hors ligne avec persistance locale
- Historique des missions

## Technologies

- React Native + Expo SDK 54
- TypeScript
- React Navigation 7
- Zustand (state management)
- Expo Location & Image Picker
- React Native Maps
- Google Generative AI
