# Firebase Migration Guide - Server Storage Setup

This guide will help you migrate from localStorage to Firebase Firestore so your data is stored on servers and accessible from any device.

## Why Firebase Firestore?

✅ **Server Storage** - Data stored in the cloud  
✅ **Access Anywhere** - Access from any device/browser  
✅ **Real-time Sync** - Changes sync automatically  
✅ **Secure** - Built-in authentication and security  
✅ **Free Tier** - Generous free tier for small businesses  

---

## Step-by-Step Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. **Project name:** `apple-bazaar-pos` (or any name you prefer)
4. **Google Analytics:** Disable (optional, you can enable later)
5. Click **"Create project"**
6. Wait ~30 seconds for project creation

### Step 2: Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll set rules next)
4. Choose a **location** closest to your users (e.g., `us-central`, `europe-west`)
5. Click **"Enable"**
6. Wait for database creation

### Step 3: Configure Firestore Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

**Note:** For now, we'll use a simpler approach. Update rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all authenticated users (you can restrict later)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the **⚙️ Settings icon** (gear) → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. **App nickname:** `APPLE BAZAAR POS`
5. **Firebase Hosting:** Don't check (optional)
6. Click **"Register app"**
7. **Copy the `firebaseConfig` object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### Step 5: Enable Authentication

1. In Firebase Console, click **"Authentication"** in left menu
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click **"Email/Password"**
   - Toggle **"Enable"**
   - Click **"Save"**

### Step 6: Install Firebase SDK

Run this command in your terminal:

```bash
cd /Users/macbook/pos-system
npm install firebase
```

### Step 7: Configure Firebase in Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config from Step 4:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
}
```

### Step 8: Switch to Firebase DataContext

**Option A: Replace the file** (Recommended)

1. Backup your current DataContext:
   ```bash
   cp src/context/DataContext.jsx src/context/DataContext.localStorage.backup.jsx
   ```

2. Replace with Firebase version:
   ```bash
   cp src/context/DataContext.firebase.js src/context/DataContext.jsx
   ```

**Option B: Manual merge** - Copy functions from `DataContext.firebase.js` into your existing `DataContext.jsx`

### Step 9: Update User ID Storage

The Firebase service needs to know the current user. Update `src/services/firebaseService.js`:

Find this function and update it:

```javascript
const getUserId = () => {
  // Get from Firebase Auth or fallback to localStorage
  const auth = getAuth()
  if (auth.currentUser) {
    return auth.currentUser.uid
  }
  // Fallback for initial setup
  return localStorage.getItem('firebaseUserId') || 'default-user'
}
```

### Step 10: Test Your Setup

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. The app should now connect to Firebase
3. Create a sale or add inventory - it should save to Firebase
4. Check Firebase Console → Firestore Database → Data tab to see your data

---

## Data Structure in Firebase

Your data will be stored like this:

```
users/
  └── {userId}/
      ├── stores/
      │   └── {storeId}/
      │       ├── inventory/
      │       ├── sales/
      │       └── customers/
      └── settings/
          ├── app
          └── currentStore
```

---

## Migration from localStorage

If you have existing data in localStorage:

1. Export your data from the app (Admin → Settings → Create Backup)
2. After Firebase setup, import the backup
3. Or manually migrate data using Firebase Console

---

## Troubleshooting

### "Firebase: Error (auth/user-not-found)"
- Make sure Authentication is enabled
- Check that users are being created properly

### "Firebase: Missing or insufficient permissions"
- Check Firestore security rules
- Make sure rules allow authenticated users

### Data not syncing
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure user is authenticated

### Build errors
- Run `npm install` again
- Check that `firebase` package is installed
- Verify all imports are correct

---

## After Migration

Once Firebase is working:

✅ Data stored on Firebase servers  
✅ Accessible from any device  
✅ Real-time synchronization  
✅ Automatic backups  
✅ Secure with authentication  

---

## Cost

Firebase Free Tier (Spark Plan):
- **50,000 reads/day**
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB storage**

For most POS systems, this is more than enough!

Upgrade to Blaze Plan (pay-as-you-go) if you need more:
- First 50K reads/day free
- $0.06 per 100K reads after
- See [Firebase Pricing](https://firebase.google.com/pricing)

---

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Check browser console for JavaScript errors
3. Verify all configuration steps completed
4. Test with a fresh browser/incognito window

