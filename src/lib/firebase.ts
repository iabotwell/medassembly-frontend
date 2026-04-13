import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;

export const firebaseEnabled = !!apiKey;

let _auth: Auth | null = null;
let _googleProvider: GoogleAuthProvider | null = null;

if (firebaseEnabled) {
  const app = initializeApp({
    apiKey,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  });
  _auth = getAuth(app);
  _googleProvider = new GoogleAuthProvider();
}

export const auth = _auth;
export const googleProvider = _googleProvider;
