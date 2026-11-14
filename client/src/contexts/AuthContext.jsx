import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getDeviceId } from '../utils/deviceId';

// Google sign-in via Firebase Auth. The Firebase SDK is loaded lazily, so the app
// stays light for people who never sign in. Config comes from /api/auth/config.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | disabled | ready
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const authRef = useRef(null);
  const sdkRef = useRef(null);

  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/config');
        const data = await res.json();
        if (!data.enabled) {
          if (!cancelled) setStatus('disabled');
          return;
        }
        const [{ initializeApp, getApps }, authSdk] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
        const app = getApps()[0] || initializeApp(data.config);
        const auth = authSdk.getAuth(app);
        authRef.current = auth;
        sdkRef.current = authSdk;

        // Finish a redirect sign-in (used when the popup was blocked)
        authSdk.getRedirectResult(auth).catch(() => {});

        unsubscribe = authSdk.onAuthStateChanged(auth, (u) => {
          if (cancelled) return;
          setUser(u ? { uid: u.uid, name: u.displayName, email: u.email, photo: u.photoURL } : null);
          setStatus('ready');
        });
      } catch {
        if (!cancelled) setStatus('disabled');
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const getToken = useCallback(async () => {
    const current = authRef.current?.currentUser;
    return current ? current.getIdToken() : null;
  }, []);

  // fetch() that adds the signed-in user's ID token
  const authFetch = useCallback(
    async (url, options = {}) => {
      const token = await getToken();
      const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(url, { ...options, headers });
    },
    [getToken]
  );

  const signIn = useCallback(async () => {
    const auth = authRef.current;
    const sdk = sdkRef.current;
    if (!auth || !sdk) return;
    setError('');
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await sdk.signInWithPopup(auth, provider);
      // Move anything logged on this phone before sign-in into the account (only if the account is empty)
      const token = await cred.user.getIdToken();
      await fetch('/api/finance/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deviceId: getDeviceId() })
      }).catch(() => {});
    } catch (err) {
      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/operation-not-supported-in-this-environment') {
        await sdk.signInWithRedirect(auth, provider);
      } else if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err?.code === 'auth/unauthorized-domain' ? 'unauthorized-domain' : 'failed');
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    if (authRef.current && sdkRef.current) await sdkRef.current.signOut(authRef.current);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, error, signIn, signOut, getToken, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
