import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    type ConfirmationResult
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, Timestamp, serverTimestamp, onSnapshot, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC6xNwXEue9l8QuWYePDWef4DRpL_2VjM",
  authDomain: "spiritual-intelligence-path.firebaseapp.com",
  projectId: "spiritual-intelligence-path",
  storageBucket: "spiritual-intelligence-path.firebasestorage.app",
  messagingSenderId: "413902256833",
  appId: "1:413902256833:web:9e6b404990b5f588be7240",
  measurementId: "G-0N7YZJXLN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    db, 
    storage,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    googleProvider,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    Timestamp,
    serverTimestamp,
    onSnapshot,
    orderBy,
    limit,
    ref,
    uploadBytesResumable,
    getDownloadURL
};
