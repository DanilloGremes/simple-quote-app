import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// --- CONFIGURAÇÕES ---
const firebaseConfig = {
  apiKey: "AIzaSyC1MM4AQBtGZvMt52--4KgQBh72LE8vyOA",
  authDomain: "simple-quote-app-1c167.firebaseapp.com",
  projectId: "simple-quote-app-1c167",
  storageBucket: "simple-quote-app-1c167.firebasestorage.app",
  messagingSenderId: "72361874542",
  appId: "1:72361874542:web:02b79379204b499eccc27f",
  measurementId: "G-S4V9DQDBZS"
};

// --- INICIALIZAÇÃO ---
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Funções prontas para usar no App
export const loginGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao fazer login. Tente novamente.");
  }
};

export const logout = () => signOut(auth);