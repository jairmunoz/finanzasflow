import * as firebaseApp from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBAcnLgZfY1-xiArov2QDUYtwBlMktIego",
  authDomain: "personal-1e591.firebaseapp.com",
  projectId: "personal-1e591",
  storageBucket: "personal-1e591.firebasestorage.app",
  messagingSenderId: "357250297396",
  appId: "1:357250297396:web:3c5e184234eb5535326461"
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);