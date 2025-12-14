# Mobile App Code Template

## What to Share

Please share these code snippets from your mobile app:

### 1. Firebase Initialization

```javascript
// Your firebase.js or firebase config file
// Share the initialization code
```

### 2. Login Function

```javascript
// Your login function
// Share how you authenticate and read user data
```

### 3. Error Location

```javascript
// Where the error occurs
// Share the code that tries to access Firestore
```

---

## Expected Code Structure

### React Native Example (What it should look like):

```javascript
// firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCRRwowUGmIpKx9R-QQdKJ-8LiC3BsJpEw",
  authDomain: "apple-bazaar-pos.firebaseapp.com",
  projectId: "apple-bazaar-pos",  // MUST be same as web
  storageBucket: "apple-bazaar-pos.firebasestorage.app",
  messagingSenderId: "637833958508",
  appId: "YOUR_MOBILE_APP_ID"  // Different for mobile
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
```

### Login Function (What it should look like):

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const login = async (email, password) => {
  try {
    // Step 1: Authenticate FIRST
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Step 2: Wait for auth to complete, THEN read Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User data not found' }
    }
    
    const userData = userDoc.data()
    
    // Step 3: Check approval
    if (userData.status !== 'approved') {
      await signOut(auth)
      return { success: false, error: 'Account pending approval' }
    }
    
    return { success: true, user: userData }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

---

## Common Mistakes to Check

1. **Reading before authentication:**
   ```javascript
   // ❌ WRONG
   const userDoc = await getDoc(doc(db, 'users', userId))
   await signInWithEmailAndPassword(auth, email, password)
   ```

2. **Wrong project ID:**
   ```javascript
   // ❌ WRONG
   projectId: "different-project"
   
   // ✅ CORRECT
   projectId: "apple-bazaar-pos"
   ```

3. **Not waiting for auth:**
   ```javascript
   // ❌ WRONG
   signInWithEmailAndPassword(auth, email, password)
   const userDoc = await getDoc(...)  // Too soon!
   
   // ✅ CORRECT
   await signInWithEmailAndPassword(auth, email, password)
   const userDoc = await getDoc(...)  // After auth completes
   ```

---

Please share your actual code so I can help fix the specific issue!

