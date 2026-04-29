import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// THE "NEVER-FAIL" CONFIG
// It will try to find your keys whether you prefixed them with NEXT_PUBLIC or not.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID
};

console.log("[FIREBASE CONFIG] Initializing with Project ID:", firebaseConfig.projectId);

let app;
let auth;
let db;
let storage;

try {
  if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("[FIREBASE CONFIG] Connection Successful ✅");
  } else {
    console.warn("[FIREBASE CONFIG] API Key is missing! Check your Vercel Environment Variables.");
  }
} catch (error) {
  console.error("[FIREBASE CONFIG] Initialization Error:", error);
}

export { app, auth, db, storage };
