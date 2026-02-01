/**
 * Firebase configuration for Clarte - Auth and Firestore (frontend).
 * Replace Supabase with Firebase: use firebase/auth and firebase/firestore.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
