import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDeVbNkWv_27OXmlCC2nTrdlVKIOjNMmuM",
    authDomain: "civardaki-onkayit.firebaseapp.com",
    projectId: "civardaki-onkayit",
    storageBucket: "civardaki-onkayit.firebasestorage.app",
    messagingSenderId: "641041078038",
    appId: "1:641041078038:web:51713972c04b8491cca237"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
