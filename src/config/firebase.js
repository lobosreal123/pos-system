// Firebase Configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRRwowUGmIpKx9R-QQdKJ-8LiC3BsJpEw",
  authDomain: "apple-bazaar-pos.firebaseapp.com",
  projectId: "apple-bazaar-pos",
  storageBucket: "apple-bazaar-pos.firebasestorage.app",
  messagingSenderId: "637833958508",
  appId: "1:637833958508:web:7c1be47f8c53ee69eb3449",
  measurementId: "G-Y1967RCSDT"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore
export const db = getFirestore(app)

// Initialize Authentication
export const auth = getAuth(app)

export default app

