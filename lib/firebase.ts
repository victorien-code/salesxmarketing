import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWRI1YADVsvyRTNu09KxyRDhFpOASwueE",
  authDomain: "salesxmarketing-56f8f.firebaseapp.com",
  projectId: "salesxmarketing-56f8f",
  storageBucket: "salesxmarketing-56f8f.firebasestorage.app",
  messagingSenderId: "768177718527",
  appId: "1:768177718527:web:c9399b567ece25903578ca",
  measurementId: "G-Q3J3S9LQ0N"
};

// Initialize Firebase app
let app: FirebaseApp | null = null;

const getFirebaseApp = (): FirebaseApp => {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side');
  }
  
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  
  return app;
};

// Getter functions for Firebase services
export const getFirebaseAuth = (): Auth => {
  const app = getFirebaseApp();
  return getAuth(app);
};

export const getGoogleProvider = (): GoogleAuthProvider => {
  return new GoogleAuthProvider();
};

export const getFirebaseFirestore = (): Firestore => {
  const app = getFirebaseApp();
  return getFirestore(app);
};

export const getFirebaseStorage = (): FirebaseStorage => {
  const app = getFirebaseApp();
  return getStorage(app);
};

// Legacy exports for backward compatibility (will throw error on server)
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const googleProvider = typeof window !== 'undefined' ? getGoogleProvider() : null;
export const db = typeof window !== 'undefined' ? getFirebaseFirestore() : null;
export const storage = typeof window !== 'undefined' ? getFirebaseStorage() : null;

export default app;