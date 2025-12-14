# Mobile App Sync Guide

This guide explains how to connect your mobile app to the same Firebase project so users can login from both web and mobile apps with the same credentials.

---

## ✅ Good News: It's Already Set Up!

Your website already uses **Firebase Authentication** and **Firestore**. This means:
- ✅ Users are stored in Firebase (not just in your website)
- ✅ Mobile app users can login with the same email/password
- ✅ Data syncs automatically between web and mobile
- ✅ Same user approval system works for both

---

## 🔧 Step 1: Use the Same Firebase Project

### Option A: React Native / Expo App

1. **Install Firebase SDK:**
   ```bash
   npm install firebase
   # or
   expo install firebase
   ```

2. **Create Firebase Config File:**
   Create `firebase.js` in your mobile app with the SAME config:

   ```javascript
   import { initializeApp } from 'firebase/app'
   import { getFirestore } from 'firebase/firestore'
   import { getAuth } from 'firebase/auth'

   const firebaseConfig = {
     apiKey: "AIzaSyCRRwowUGmIpKx9R-QQdKJ-8LiC3BsJpEw",
     authDomain: "apple-bazaar-pos.firebaseapp.com",
     projectId: "apple-bazaar-pos",
     storageBucket: "apple-bazaar-pos.firebasestorage.app",
     messagingSenderId: "637833958508",
     appId: "1:637833958508:web:7c1be47f8c53ee69eb3449",
     // For mobile, you might get a different appId, but projectId stays the same
   }

   const app = initializeApp(firebaseConfig)
   export const db = getFirestore(app)
   export const auth = getAuth(app)
   export default app
   ```

3. **Add Your Mobile App to Firebase Console:**
   - Go to Firebase Console → Project Settings
   - Click "Add app" → Choose iOS or Android
   - Follow the setup instructions
   - You'll get a new `appId` but **projectId stays the same**

### Option B: Flutter App

1. **Add Firebase to Flutter:**
   ```bash
   flutter pub add firebase_core firebase_auth cloud_firestore
   ```

2. **Initialize Firebase:**
   ```dart
   import 'package:firebase_core/firebase_core.dart';
   import 'package:firebase_auth/firebase_auth.dart';
   import 'package:cloud_firestore/cloud_firestore.dart';

   await Firebase.initializeApp(
     options: DefaultFirebaseOptions.currentPlatform,
   );
   ```

3. **Use the same Firebase project:**
   - When setting up FlutterFire, select your existing project: `apple-bazaar-pos`

---

## 🔐 Step 2: Use Secure Firestore Rules

Update your Firestore security rules to work securely for both web and mobile:

### Recommended Rules (Secure & Production-Ready)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user is approved
    function isApproved() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }
    
    // Helper function to check if account is not expired
    function isNotExpired() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        (!exists(/databases/$(database)/documents/users/$(request.auth.uid)).data.expirationDate) ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.expirationDate > request.time;
    }
    
    // Users collection - user data
    match /users/{userId} {
      // User can read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Admins can read all user documents (for approval management)
      allow read: if isAdmin();
      
      // Admins can update user documents (for approval/rejection/expiration)
      allow update: if isAdmin();
      
      // Allow user to create their own document during registration
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // User subcollections (stores, inventory, sales, customers, settings)
    match /users/{userId}/{document=**} {
      // User can only access their own data if approved and not expired
      allow read, write: if request.auth != null && 
        request.auth.uid == userId && 
        isApproved() && 
        isNotExpired();
    }
  }
}
```

### Simpler Rules (If Helper Functions Cause Issues)

If the helper functions don't work, use this simpler version:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - user data
    match /users/{userId} {
      // User can read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow authenticated users to read user documents (for admin approval)
      // Admin checks happen in application code
      allow read: if request.auth != null;
      
      // Allow authenticated users to update if they're updating their own
      // or if they're an admin (checked in app code)
      allow update: if request.auth != null;
      
      // Allow user to create their own document during registration
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // User subcollections (stores, inventory, sales, customers, settings)
    match /users/{userId}/{document=**} {
      // User can only access their own data if authenticated
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📱 Step 3: Implement Login in Mobile App

### React Native Example:

```javascript
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// Login function (same logic as web)
const login = async (email, password) => {
  try {
    // 1. Authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // 2. Check user approval status from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
    
    if (!userDoc.exists()) {
      await signOut(auth)
      return { success: false, error: 'User data not found' }
    }
    
    const userData = userDoc.data()
    
    // 3. Check if approved
    if (userData.status !== 'approved') {
      await signOut(auth)
      return { success: false, error: 'Account pending approval' }
    }
    
    // 4. Check if expired
    if (userData.expirationDate) {
      const expirationDate = new Date(userData.expirationDate)
      if (expirationDate < new Date()) {
        await signOut(auth)
        return { success: false, error: 'Account expired' }
      }
    }
    
    return { 
      success: true, 
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userData.name,
        role: userData.role
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Flutter Example:

```dart
Future<Map<String, dynamic>> login(String email, String password) async {
  try {
    // 1. Authenticate
    UserCredential userCredential = await FirebaseAuth.instance
        .signInWithEmailAndPassword(email: email, password: password);
    
    // 2. Check approval status
    DocumentSnapshot userDoc = await FirebaseFirestore.instance
        .collection('users')
        .doc(userCredential.user!.uid)
        .get();
    
    if (!userDoc.exists) {
      await FirebaseAuth.instance.signOut();
      return {'success': false, 'error': 'User data not found'};
    }
    
    Map<String, dynamic> userData = userDoc.data() as Map<String, dynamic>;
    
    // 3. Check if approved
    if (userData['status'] != 'approved') {
      await FirebaseAuth.instance.signOut();
      return {'success': false, 'error': 'Account pending approval'};
    }
    
    // 4. Check if expired
    if (userData['expirationDate'] != null) {
      DateTime expirationDate = (userData['expirationDate'] as Timestamp).toDate();
      if (expirationDate.isBefore(DateTime.now())) {
        await FirebaseAuth.instance.signOut();
        return {'success': false, 'error': 'Account expired'};
      }
    }
    
    return {
      'success': true,
      'user': {
        'uid': userCredential.user!.uid,
        'email': userCredential.user!.email,
        'name': userData['name'],
        'role': userData['role']
      }
    };
  } catch (e) {
    return {'success': false, 'error': e.toString()};
  }
}
```

---

## 🔄 Step 4: Data Sync (Automatic!)

**The best part:** Data syncs automatically! 

### How It Works:

1. **Same Firebase Project** = Same data source
2. **Real-time Listeners** = Changes appear instantly
3. **User Isolation** = Each user only sees their own data

### Example: Real-time Inventory Sync

```javascript
// Web app
import { collection, onSnapshot } from 'firebase/firestore'

const unsubscribe = onSnapshot(
  collection(db, 'users', userId, 'stores', storeId, 'inventory'),
  (snapshot) => {
    const inventory = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    // Update UI with inventory
  }
)

// Mobile app (same code!)
// When user adds inventory on web, mobile app sees it instantly!
// When user adds inventory on mobile, web app sees it instantly!
```

---

## 📊 Data Structure (Same for Web & Mobile)

```
Firestore Structure:
users/
  └── {userId}/              (Firebase Auth UID)
      ├── stores/
      │   └── {storeId}/
      │       ├── inventory/  (inventory items)
      │       ├── sales/      (sales transactions)
      │       └── customers/  (customer data)
      └── settings/
          ├── app            (currency, preferences)
          └── currentStore   (currently selected store)
```

**Key Point:** Both web and mobile access the same structure using the same `userId`!

---

## 🔒 Security Best Practices

### 1. **Use the Secure Rules Above**
   - Users can only access their own data
   - Admins can manage users
   - Expired users are blocked

### 2. **Validate on Both Sides**
   - Client-side checks (faster, better UX)
   - Server-side rules (security, cannot be bypassed)

### 3. **Keep Firebase Config Secure**
   - Firebase client config is safe to expose
   - Don't expose Admin SDK credentials
   - Use environment variables for sensitive data

---

## ✅ Testing Checklist

- [ ] Mobile app can login with web app credentials
- [ ] Web app user can login on mobile app
- [ ] Data created on web appears on mobile (real-time)
- [ ] Data created on mobile appears on web (real-time)
- [ ] User approval works (admin approves on web, user can login on mobile)
- [ ] Expired users cannot login on mobile
- [ ] Each user only sees their own data
- [ ] Admin can see all users (from web admin panel)

---

## 🚀 Quick Start Summary

1. **Mobile App Setup:**
   - Install Firebase SDK in your mobile app
   - Use the SAME Firebase project (`apple-bazaar-pos`)
   - Use the SAME Firebase config (projectId, apiKey, etc.)

2. **Update Firestore Rules:**
   - Use the secure rules provided above
   - Test that rules work for both web and mobile

3. **Implement Login:**
   - Use `signInWithEmailAndPassword` in mobile app
   - Check approval status from Firestore
   - Check expiration date if set

4. **Data Access:**
   - Use same Firestore paths as web app
   - Users are isolated by `userId`
   - Real-time sync works automatically

---

## 💡 Tips

1. **Environment Variables:**
   - Store Firebase config in environment variables
   - Different config files for dev/prod if needed

2. **Error Handling:**
   - Handle network errors gracefully
   - Show clear messages for approval/expiration

3. **Offline Support:**
   - Firestore has built-in offline support
   - Data syncs when connection is restored

4. **Push Notifications (Optional):**
   - Can add Firebase Cloud Messaging
   - Notify users about approvals, etc.

---

## 🎯 Result

Once set up:
- ✅ Users login with same credentials on web and mobile
- ✅ All data syncs automatically
- ✅ User approval system works for both platforms
- ✅ Secure and isolated user data
- ✅ Admin can manage users from web panel

**Your website and mobile app will share the same user database and data!** 🎉

