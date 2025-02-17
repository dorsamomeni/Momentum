import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcEJPObD_XKxoiAoCdJhv77bGHtFdrlgQ",
  authDomain: "momentum-fb140.firebaseapp.com",
  projectId: "momentum-fb140",
  storageBucket: "momentum-fb140.firebasestorage.app",
  messagingSenderId: "432908468966",
  appId: "1:432908468966:web:d9048819ee31191ac8b127",
  measurementId: "G-BV8LC13DR0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a time
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    // The current browser doesn't support persistence
    console.log('Persistence not supported by browser');
  }
}); 