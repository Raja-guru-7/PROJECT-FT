import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyARRQyteMYWZHzeeiE1AIv9L7xxo0ZeiAM",
  authDomain: "aroundu-a76dd.firebaseapp.com",
  projectId: "aroundu-a76dd",
  storageBucket: "aroundu-a76dd.firebasestorage.app",
  messagingSenderId: "685016854801",
  appId: "1:685016854801:web:51e66b7894b0a94f491cb0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();