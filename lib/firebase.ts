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

let firebaseApp: FirebaseApp
let firebaseAuth: Auth
let firestoreDb: Firestore

function getFirebase(): FirebaseApp {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig)
  } else {
    firebaseApp = getApps()[0] as FirebaseApp
  }
  return firebaseApp
}

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    const app = getFirebase()
    firebaseAuth = getAuth(app)
  }
  return firebaseAuth
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreDb) {
    const app = getFirebase()
    firestoreDb = getFirestore(app)
  }
  return firestoreDb
}

export { getFirebase as getFirebaseApp }
