// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmsRK2A6GxckwvNs3UqunXfy162ySj6BA",
  authDomain: "melodymatch-d5cca.firebaseapp.com",
  projectId: "melodymatch-d5cca",
  storageBucket: "melodymatch-d5cca.firebasestorage.app",
  messagingSenderId: "229833622480",
  appId: "1:229833622480:web:51f6f2bd2f2bbc6936afd5",
  measurementId: "G-PFTKX8PQCE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db};