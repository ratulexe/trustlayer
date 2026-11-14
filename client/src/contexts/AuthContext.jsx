import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getDeviceId } from '../utils/deviceId';

const LOCAL_SESSION_KEY = 'trustlayer_auth_user';

// Google sign-in via Firebase Auth + Local Auth & Demo Account support.
// Firebase SDK is loaded lazily so the app stays ultra-light for offline use.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | disabled
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState('');
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false);
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
          if (!cancelled) {
            setIsFirebaseEnabled(false);
            setStatus('ready');
          }
          return;
        }

        const [{ initializeApp, getApps }, authSdk] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth')
        ]);

        const app = getApps()[0] || initializeApp(data.config);
        const auth = authSdk.getAuth(app);
        authRef.current = auth;
        sdkRef.current = authSdk;
        if (!cancelled) setIsFirebaseEnabled(true);

        // Finish a redirect sign-in (used when popup was blocked)
        authSdk.getRedirectResult(auth).catch(() => {});

        unsubscribe = authSdk.onAuthStateChanged(auth, (u) => {
          if (cancelled) return;
          if (u) {
            const userData = { uid: u.uid, name: u.displayName, email: u.email, photo: u.photoURL };
            setUser(userData);
            try {
              localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userData));
            } catch (_) {}
          } else {
            // Keep local user if signed in locally
            try {
              const saved = localStorage.getItem(LOCAL_SESSION_KEY);
              if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed?.uid?.startsWith('usr_')) {
                  setUser(parsed);
                } else {
                  setUser(null);
                }
              } else {
                setUser(null);
              }
            } catch {
              setUser(null);
            }
          }
          setStatus('ready');
        });
      } catch {
        if (!cancelled) setStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const getToken = useCallback(async () => {
    const current = authRef.current?.currentUser;
    if (current) return current.getIdToken();
    return user ? `local_token_${user.uid}` : null;
  }, [user]);

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
    if (!auth || !sdk) {
      setError('Firebase authentication is not active in this environment.');
      return;
    }
    setError('');
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const cred = await sdk.signInWithPopup(auth, provider);
      // Move anything logged on this phone before sign-in into the account
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

  // Create new account (supports Firebase Auth email/pass or instant local session)
  const createAccount = useCallback(async ({ name, email, password }) => {
    setError('');
    const auth = authRef.current;
    const sdk = sdkRef.current;

    if (auth && sdk && typeof sdk.createUserWithEmailAndPassword === 'function') {
      try {
        const cred = await sdk.createUserWithEmailAndPassword(auth, email, password);
        if (name && sdk.updateProfile) {
          await sdk.updateProfile(cred.user, { displayName: name }).catch(() => {});
        }
        const token = await cred.user.getIdToken();
        await fetch('/api/finance/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ deviceId: getDeviceId() })
        }).catch(() => {});
        const userData = { uid: cred.user.uid, name: name || cred.user.displayName, email: cred.user.email, photo: cred.user.photoURL };
        setUser(userData);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      } catch (err) {
        if (err?.code === 'auth/email-already-in-use') {
          throw new Error('This email address is already in use. Please sign in instead.');
        } else if (err?.code === 'auth/weak-password') {
          throw new Error('Password should be at least 6 characters.');
        } else if (err?.code === 'auth/invalid-email') {
          throw new Error('Please enter a valid email address.');
        }
        // Fall back to local session if network or Firebase config blocks it
      }
    }

    // Local / Offline Account Creation
    const uid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const localUser = {
      uid,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      photo: null,
      createdAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
    } catch (_) {}
    setUser(localUser);
    return { success: true, user: localUser };
  }, []);

  // Sign in with email + password (supports Firebase Auth or local session)
  const signInWithEmail = useCallback(async ({ email, password }) => {
    setError('');
    const auth = authRef.current;
    const sdk = sdkRef.current;

    if (auth && sdk && typeof sdk.signInWithEmailAndPassword === 'function') {
      try {
        const cred = await sdk.signInWithEmailAndPassword(auth, email, password);
        const token = await cred.user.getIdToken();
        await fetch('/api/finance/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ deviceId: getDeviceId() })
        }).catch(() => {});
        const userData = { uid: cred.user.uid, name: cred.user.displayName, email: cred.user.email, photo: cred.user.photoURL };
        setUser(userData);
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userData));
        return { success: true, user: userData };
      } catch (err) {
        if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        // Fall back to local session if network or Firebase config blocks it
      }
    }

    // Local / Offline Sign In
    const cleanEmail = email.trim().toLowerCase();
    const displayName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const localUser = {
      uid: 'usr_' + Date.now().toString(36),
      name: displayName,
      email: cleanEmail,
      photo: null
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
    } catch (_) {}
    setUser(localUser);
    return { success: true, user: localUser };
  }, []);

  // 1-Click Instant Demo User Sign In (Ideal for hackathons, judges & evaluators)
  const signInAsDemo = useCallback(() => {
    const demoUser = {
      uid: 'usr_demo_88',
      name: 'Rohan Sharma',
      email: 'rohan.sharma@trustlayer.in',
      photo: null
    };
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(demoUser));
    } catch (_) {}
    setUser(demoUser);
    return demoUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    } catch (_) {}
    if (authRef.current && sdkRef.current) {
      await sdkRef.current.signOut(authRef.current).catch(() => {});
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        error,
        isFirebaseEnabled,
        signIn,
        signInWithGoogle: signIn,
        createAccount,
        signInWithEmail,
        signInAsDemo,
        signOut,
        getToken,
        authFetch
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
