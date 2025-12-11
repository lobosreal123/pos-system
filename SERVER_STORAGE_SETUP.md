# Server Storage Setup Guide

This guide will help you migrate from localStorage to server-based storage (Firebase Firestore) so data can be accessed from any device.

## Current Situation

- ✅ Data stored in browser's localStorage
- ❌ Data is lost when browser cache is cleared
- ❌ Data is NOT shared across devices
- ❌ Data is lost when using different browsers

## Solution: Firebase Firestore

We'll use Firebase Firestore to store data on the cloud so:
- ✅ Data persists on server
- ✅ Accessible from any device/browser
- ✅ Real-time synchronization
- ✅ Free tier available
- ✅ Secure authentication

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Project name: `apple-bazaar-pos` (or any name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for project creation

---

## Step 2: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (closest to your users)
5. Click **"Enable"**

---

## Step 3: Set Up Authentication Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users (you can restrict this later)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the **⚙️ Settings** icon → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click **"Web"** icon (`</>`)
4. Register app: `APPLE BAZAAR POS`
5. Copy the `firebaseConfig` object
6. You'll need this in the next step

---

## Step 5: Install Firebase

Run this command:
```bash
cd /Users/macbook/pos-system
npm install firebase
```

---

## Step 6: Configure Firebase in Your App

The code has been updated to use Firebase. You just need to:

1. Create a file: `src/config/firebase.js`
2. Add your Firebase configuration there
3. The DataContext will automatically use Firebase instead of localStorage

---

## After Setup

Once configured:
- ✅ All data stored on Firebase servers
- ✅ Accessible from any device
- ✅ Real-time sync across devices
- ✅ Secure with authentication
- ✅ Automatic backups

---

## Cost

Firebase Free Tier includes:
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

This should be sufficient for most POS systems. Check [Firebase Pricing](https://firebase.google.com/pricing) for details.

