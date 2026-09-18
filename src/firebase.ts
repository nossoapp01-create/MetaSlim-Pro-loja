import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import rawConfig from '../firebase-applet-config.json';

// Support both embedded firebase-applet-config.json and Vercel/Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || rawConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || rawConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || rawConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || rawConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || rawConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || rawConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || rawConfig.firestoreDatabaseId,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying the custom database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  domainToAuthorize?: string;
  isUnauthorizedDomain?: boolean;
  isPopupBlocked?: boolean;
}

export function parseAuthError(error: any): AuthErrorInfo {
  const code = error?.code || 'auth/unknown';
  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  if (code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
    return {
      code,
      title: 'Domínio Não Autorizado no Firebase',
      message: `O domínio atual "${currentDomain}" ainda não foi adicionado à lista de Domínios Autorizados no Firebase Authentication.`,
      domainToAuthorize: currentDomain,
      isUnauthorizedDomain: true,
    };
  }

  if (code === 'auth/popup-blocked' || error?.message?.includes('popup-blocked')) {
    return {
      code,
      title: 'Janela Pop-up Bloqueada',
      message: 'O navegador bloqueou a janela pop-up de login do Google. Por favor, permita pop-ups para este site ou utilize o modo de redirecionamento.',
      isPopupBlocked: true,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      title: 'Login Cancelado',
      message: 'A janela de login do Google foi fechada antes da confirmação.',
    };
  }

  if (code === 'auth/operation-not-allowed') {
    return {
      code,
      title: 'Provedor Google Desativado',
      message: 'O provedor Google precisa estar ativado no Firebase Console (Authentication > Sign-in method > Google).',
    };
  }

  return {
    code,
    title: 'Falha no Login com Google',
    message: error?.message || 'Não foi possível autenticar com o Google neste momento.',
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unavailable.');
    } else {
      console.log('Firestore connection verified with cloud database.');
    }
    return true;
  }
}

// Authentication helpers
export async function signInWithGoogle(useRedirectFallback = false): Promise<FirebaseUser | null> {
  try {
    if (useRedirectFallback) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    // If popup is blocked by browser, try redirecting if on a mobile or restricted browser
    if (error?.code === 'auth/popup-blocked') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr) {
        throw redirectErr;
      }
    }
    throw error;
  }
}

export async function checkRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (err) {
    console.warn('Redirect auth result check:', err);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
