
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Vérification des clés Firebase.
// On affiche un avertissement si une clé est manquante au lieu de bloquer l'application.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(`Configuration Firebase incomplète. Clés manquantes : ${missingKeys.join(', ')}. Certaines fonctionnalités pourraient ne pas fonctionner.`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services conditionally to avoid errors if config is missing
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  if (firebaseConfig.apiKey) {
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Erreur lors de l'initialisation des services Firebase :", error);
}

export { auth, db };
export { app };
