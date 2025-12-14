// Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBJYMKZv3OfUmv2WcDRYNVUUHBjJjvByeA",
  authDomain: "studyplan-dd002.firebaseapp.com",
  projectId: "studyplan-dd002",
  storageBucket: "studyplan-dd002.firebasestorage.app",
  messagingSenderId: "621810956082",
  appId: "1:621810956082:web:8acdab7bdfb3d6d548c92b",
  measurementId: "G-BQPFLSDMHY"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Initialiser Analytics (optionnel, seulement en production)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export default app;