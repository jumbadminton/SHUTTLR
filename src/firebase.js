import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAVe8Uo-4dKA9NZSdmJFeebEnu5_HFGyaE",
  authDomain: "shuttlr2026.firebaseapp.com",
  projectId: "shuttlr2026",
  storageBucket: "shuttlr2026.firebasestorage.app",
  messagingSenderId: "1045654857416",
  appId: "1:1045654857416:web:c6579942b55a94f67e27fd"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
