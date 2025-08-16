// src/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD_-MLWcpdSJVUSB2AqmO3JHs8nf_cRD44",
  authDomain: "sjecaero.firebaseapp.com",
  projectId: "sjecaero",
  storageBucket: "sjecaero.firebasestorage.app",
  messagingSenderId: "887440722897",
  appId: "1:887440722897:web:96d02e2e7c45ceb81c2ef0"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);