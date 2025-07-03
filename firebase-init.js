// تهيئة Firebase لجميع الصفحات
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHsH75wfxcTLGcuusl1onxAmSMzmQbtBM",
  authDomain: "basmadoha-1.firebaseapp.com",
  projectId: "basmadoha-1",
  storageBucket: "basmadoha-1.appspot.com",
  messagingSenderId: "772941385267",
  appId: "1:772941385267:web:751c121aae0edbee709d46",
  measurementId: "G-NGJHY71ZD1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
getAnalytics(app);

export {
  db,
  auth,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  query,
  where,
  getDocs,
  onSnapshot
};
