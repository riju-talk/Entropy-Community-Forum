// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfIJ_-5FMtEShFjxm-5S5xrAZL2W4T6Uw",
  authDomain: "entropy-53ac4.firebaseapp.com",
  projectId: "entropy-53ac4",
  storageBucket: "entropy-53ac4.firebasestorage.app",
  messagingSenderId: "336909724845",
  appId: "1:336909724845:web:bce86cb84c780a1a15aa24",
  measurementId: "G-4E3FP09S5S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
