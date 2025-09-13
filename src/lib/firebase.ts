
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification bloquante pour s'assurer que les clés Firebase sont définies.
// Si une clé est manquante, l'application ne démarrera pas et affichera une erreur claire.
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(`Configuration Firebase manquante : La variable d'environnement pour "${key}" n'est pas définie. Veuillez vérifier votre fichier .env.`);
  }
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ATTENTION: n'importer `auth` que dans des composants 'use client'
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
