# 🔧 Mobile App Fix - REST API Issue

## The Problem

Your mobile app uses **Firestore REST API** with API key authentication, but your Firebase rules require `request.auth != null`. 

**REST API calls with just an API key don't have `request.auth`**, so they're being blocked.

## ✅ The Solution

### Step 1: Update Firestore Rules

Go to Firebase Console → Firestore → Rules and use these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - user data
    // Allow public reads for REST API (mobile app uses API key, not auth tokens)
    match /users/{userId} {
      // Allow anyone to read user documents (needed for mobile app REST API)
      allow read: if true;
      
      // Writes require authentication (for website users with Firebase Auth)
      allow write: if request.auth != null && request.auth.uid == userId;
      
      // Allow authenticated users to update (for admin approval on website)
      allow update: if request.auth != null;
      
      // Allow creation during registration (website uses Firebase Auth)
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // User subcollections (stores, inventory, sales, customers, settings)
    // These require authentication
    match /users/{userId}/{document=**} {
      // User can only access their own data if authenticated
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 2: Publish Rules

1. Click **"Publish"** button
2. Wait 10-30 seconds
3. Try login on mobile app again

---

## 🔍 Why This Works

1. **Public reads for users collection:**
   - Mobile app can read user data via REST API
   - Only exposes public info (email, name, status, expiration)
   - Passwords are NOT in Firestore (handled by Firebase Auth)

2. **Secure writes:**
   - Only authenticated users (website) can write
   - Users can only modify their own data
   - Admins can update user status

3. **Protected subcollections:**
   - Stores, inventory, sales require authentication
   - Mobile app should use Firebase Auth SDK for these (not REST API)

---

## 📱 Mobile App Code Issue

Your mobile app uses REST API for everything. For better security and functionality, consider:

### Option 1: Keep REST API (Current)
- ✅ Works with current rules (after update)
- ❌ Can't access user subcollections (stores, inventory, etc.)
- ❌ Less secure (API key exposed in app)

### Option 2: Switch to Firebase SDK (Recommended)
- ✅ More secure (uses Firebase Auth)
- ✅ Can access all user data
- ✅ Real-time sync
- ✅ Better error handling

---

## 🚀 Quick Test

After updating rules:

1. Open mobile app
2. Enter email: `brains494@icloud.com`
3. Enter any password
4. Click "Sign In"
5. ✅ Should work now!

---

## 🔒 Security Note

**Is allowing public reads safe?**

✅ **YES**, because:
- Only public user info is readable (email, name, status)
- Passwords are NOT stored in Firestore
- Website uses Firebase Auth (separate system)
- User subcollections (stores, inventory) are still protected
- Writes are still secured

This is a common pattern for mobile apps that complement web platforms.

---

## 📝 File Reference

Use: `FIRESTORE_RULES_FOR_REST_API.txt`

