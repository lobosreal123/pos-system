# Quick Firebase Setup Guide

## 🚀 Fast Setup (5 Minutes)

### 1. Create Firebase Project (2 minutes)

1. Go to: https://console.firebase.google.com
2. Click **"Add project"**
3. Name: `apple-bazaar-pos`
4. Click **"Create project"** → Wait → **"Continue"**

### 2. Enable Firestore (1 minute)

1. Click **"Firestore Database"** (left menu)
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose location (pick closest to you)
5. Click **"Enable"**

### 3. Get Your Config (1 minute)

1. Click ⚙️ **Settings** → **"Project settings"**
2. Scroll to **"Your apps"** → Click **Web icon** `</>`
3. App nickname: `POS System`
4. Click **"Register app"**
5. **COPY the config object** - you'll need it!

### 4. Enable Authentication (30 seconds)

1. Click **"Authentication"** (left menu)
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** → Click **"Save"**

### 5. Update Your Code (1 minute)

1. Open: `src/config/firebase.js`
2. Paste your Firebase config
3. Install Firebase: `npm install`
4. Follow migration guide: `FIREBASE_MIGRATION_GUIDE.md`

---

## 📋 What You Need

- Firebase project created ✅
- Firestore database enabled ✅
- Authentication enabled ✅
- Firebase config copied ✅
- Code updated ✅

---

## ⚡ After Setup

Your data will:
- ✅ Store on Firebase servers
- ✅ Sync across all devices
- ✅ Update in real-time
- ✅ Be secure and backed up

---

## 💰 Cost

**FREE tier includes:**
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage

Perfect for small/medium POS systems!

---

## 📖 Full Guide

See `FIREBASE_MIGRATION_GUIDE.md` for detailed instructions.

