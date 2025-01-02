// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoPTho7VGJ7gJIDPDatJBaIEourJEcXAY",
  // apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "khanchuwa-web.firebaseapp.com",
  projectId: "khanchuwa-web",
  storageBucket: "khanchuwa-web.firebasestorage.app",
  messagingSenderId: "745023595063",
  appId: "1:745023595063:web:5f7de43b042832c4e015b2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);