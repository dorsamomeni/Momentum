import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcEJPObD_XKxoiAoCdJhv77bGHtFdrlgQ",
  authDomain: "momentum-fb140.firebaseapp.com",
  projectId: "momentum-fb140",
  storageBucket: "momentum-fb140.firebasestorage.app",
  messagingSenderId: "432908468966",
  appId: "1:432908468966:web:d9048819ee31191ac8b127",
  measurementId: "G-BV8LC13DR0",
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 