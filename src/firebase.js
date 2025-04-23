// Imports the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from 'firebase/storage';


// MelodyMatch's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmsRK2A6GxckwvNs3UqunXfy162ySj6BA",
  authDomain: "melodymatch-d5cca.firebaseapp.com",
  projectId: "melodymatch-d5cca",
  storageBucket: "melodymatch-d5cca.firebasestorage.app",
  messagingSenderId: "229833622480",
  appId: "1:229833622480:web:51f6f2bd2f2bbc6936afd5",
  measurementId: "G-PFTKX8PQCE"
};

// Initializes Firebase so I can use the various firebase functions
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

export {app, auth, db, storage};