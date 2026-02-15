/**
 * Firebase configuration for Clarte - Auth and Firestore (frontend).
 * Replace Supabase with Firebase: use firebase/auth and firebase/firestore.
 * Uses env vars when set; falls back to Clarte project config so login works on clarte.io
 * even when build env (e.g. Firebase Hosting) has no NEXT_PUBLIC_FIREBASE_* set.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const clarteFallback = {
  apiKey: "AIzaSyAElfJYllj4ZTl1n08Imz5f7DLakygKhVg",
  authDomain: "clarte-8aece.firebaseapp.com",
  projectId: "clarte-8aece",
  storageBucket: "clarte-8aece.firebasestorage.app",
  messagingSenderId: "698398127871",
  appId: "1:698398127871:web:6de36f026d1f7a9b01feca",
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? clarteFallback.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? clarteFallback.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? clarteFallback.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? clarteFallback.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? clarteFallback.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? clarteFallback.appId,
}

/** Only initialize when API key is set (avoids build/SSG errors when env is missing). */
function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null
let firestoreDb: Firestore | null = null

function getFirebase(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.")
  }
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    firebaseApp = getApps()[0] as FirebaseApp
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null
  if (!firebaseAuth) {
    const app = getFirebase()
    firebaseAuth = getAuth(app)
  }
  return firebaseAuth
}

export function getFirebaseFirestore(): Firestore | null {
  if (!isFirebaseConfigured()) return null
  if (!firestoreDb) {
    const app = getFirebase()
    firestoreDb = getFirestore(app)
  }
  return firestoreDb
}

export { isFirebaseConfigured }

export { getFirebase as getFirebaseApp }
