// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD_-MLWcpdSJVUSB2AqmO3JHs8nf_cRD44",
  authDomain: "sjecaero.firebaseapp.com",
  projectId: "sjecaero",
  storageBucket: "sjecaero.firebasestorage.app",
  messagingSenderId: "887440722897",
  appId: "1:887440722897:web:96d02e2e7c45ceb81c2ef0"
};


// Initialize Firebase
let firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
