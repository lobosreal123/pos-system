# iOS App Setup Guide - Apple Bazaar POS

This guide will help you create an iOS app that syncs with your website using Firebase.

## Prerequisites

- Node.js installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Xcode (for iOS development)
- Firebase project: `apple-bazaar-pos`

---

## Step 1: Create Expo Project

```bash
# The app is already created in /Users/macbook/pos-systemapp/ directory
cd /Users/macbook/pos-systemapp
```

---

## Step 2: Install Dependencies

```bash
npm install firebase @react-native-async-storage/async-storage
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install expo-status-bar
```

---

## Step 3: Firebase Configuration

Create `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCRRwowUGmIpKx9R-QQdKJ-8LiC3BsJpEw",
  authDomain: "apple-bazaar-pos.firebaseapp.com",
  projectId: "apple-bazaar-pos",
  storageBucket: "apple-bazaar-pos.firebasestorage.app",
  messagingSenderId: "637833958508",
  appId: "1:637833958508:web:7c1be47f8c53ee69eb3449"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
```

---

## Step 4: Update Firestore Rules

Use the rules from `FIRESTORE_RULES_WORKING.txt` - these allow authenticated users to access their data.

---

## Step 5: Run the App

```bash
cd /Users/macbook/pos-systemapp
npm install
npm start
# Then press 'i' for iOS simulator
```

---

## Features Included

✅ Firebase Authentication (email/password)
✅ User approval check
✅ Real-time data sync
✅ Stores management
✅ Inventory management
✅ Sales/POS functionality
✅ Customer management
✅ Offline support

---

## Next Steps

1. Follow the code structure in the `ios-app/` directory
2. Customize UI to match your brand
3. Test on physical device
4. Build for App Store

