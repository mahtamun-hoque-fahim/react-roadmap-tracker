import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'

// Replace the values below with your Firebase project config
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUK1LjyPGkTZJqmgjUSNqjswAJTrgX2FI",
  authDomain: "react-roadmap-tracker.firebaseapp.com",
  projectId: "react-roadmap-tracker",
  storageBucket: "react-roadmap-tracker.firebasestorage.app",
  messagingSenderId: "821626618769",
  appId: "1:821626618769:web:8f47f3ea18aa47b6eb1030",
  measurementId: "G-BKQ8X83WQR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function signOutUser() {
  return signOut(auth)
}

export async function saveProgressForUser(uid, data) {
  if (!uid) return
  const ref = doc(db, 'roadmaps', uid)
  await setDoc(ref, { updatedAt: new Date().toISOString(), data }, { merge: true })
}

export async function loadProgressForUser(uid) {
  if (!uid) return null
  const ref = doc(db, 'roadmaps', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data().data || null
}
