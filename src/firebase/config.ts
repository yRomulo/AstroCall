import type { FirebaseOptions } from 'firebase/app';

function requiredPublicEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const firebaseConfig: FirebaseOptions = {
  apiKey: requiredPublicEnv(firebaseEnv.apiKey, 'NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: requiredPublicEnv(firebaseEnv.authDomain, 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredPublicEnv(firebaseEnv.projectId, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  appId: requiredPublicEnv(firebaseEnv.appId, 'NEXT_PUBLIC_FIREBASE_APP_ID'),
  messagingSenderId: requiredPublicEnv(
    firebaseEnv.messagingSenderId,
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  ),
  measurementId: firebaseEnv.measurementId,
};
