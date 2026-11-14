const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

let db = null;
let isFirestoreConnected = false;

// Key file locations: project root (local dev) or Render's Secret Files folder
const KEY_FILE_CANDIDATES = [
  path.resolve(__dirname, '../../serviceAccountKey.json'),
  '/etc/secrets/serviceAccountKey.json'
];
const serviceAccountPath = KEY_FILE_CANDIDATES.find((p) => fs.existsSync(p)) || null;

try {
  if (serviceAccountPath) {
    // 1. Initialize from local serviceAccountKey.json if present
    const serviceAccount = require(serviceAccountPath);
    if (!getApps().length) {
      initializeApp({
        credential: cert(serviceAccount)
      });
    }
    db = getFirestore();
    isFirestoreConnected = true;
    console.log('[TrustLayer] Cloud Firestore connected via serviceAccountKey.json');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    // 2. Initialize from .env environment variables
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n')
        })
      });
    }
    db = getFirestore();
    isFirestoreConnected = true;
    console.log('[TrustLayer] Cloud Firestore connected via .env variables');
  } else {
    console.log('[TrustLayer] Firestore credentials not found yet. Running in offline fallback mode.');
  }
} catch (err) {
  console.warn('[TrustLayer] Firebase initialization note:', err.message);
  db = null;
  isFirestoreConnected = false;
}

// Project ID for the browser sign-in config (from the key file or env)
// (the key file wins, matching how Firestore itself is initialised above)
let projectId = null;
try {
  if (serviceAccountPath) projectId = require(serviceAccountPath).project_id || null;
} catch (_) {}
if (!projectId) projectId = process.env.FIREBASE_PROJECT_ID || null;

/**
 * Verifies a Firebase Auth ID token from the browser (Google sign-in).
 * Returns { uid, name, email, picture } or null when missing/invalid/not configured.
 */
async function verifyIdToken(idToken) {
  if (!idToken || !getApps().length) return null;
  try {
    const { getAuth } = require('firebase-admin/auth');
    const decoded = await getAuth().verifyIdToken(idToken);
    return { uid: decoded.uid, name: decoded.name || null, email: decoded.email || null, picture: decoded.picture || null };
  } catch (_) {
    return null;
  }
}

module.exports = {
  db,
  isFirestoreConnected,
  projectId,
  verifyIdToken,
  FieldValue
};
