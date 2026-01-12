import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAehpv64gUWHWaGW8wPG8QGwFwsapdP9ic",
  authDomain: "weather-app-7bc1c.firebaseapp.com",
  projectId: "weather-app-7bc1c",
  storageBucket: "weather-app-7bc1c.firebasestorage.app",
  messagingSenderId: "1032018895574",
  appId: "1:1032018895574:web:cd948744461cdd25001f77",
  measurementId: "G-27JFQR5Z7H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
