import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDrXk0MBqHHBZ3bAWpoCdYEAAK5Re-Q4pk",
  authDomain: "pro-chartist.firebaseapp.com",
  databaseURL: "https://pro-chartist-default-rtdb.firebaseio.com",
  projectId: "pro-chartist",
  storageBucket: "pro-chartist.firebasestorage.app",
  messagingSenderId: "461692977620",
  appId: "1:461692977620:web:a5f490f534654cb2821641",
  measurementId: "G-0DMRTB6YM2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };