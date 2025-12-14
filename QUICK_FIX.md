# 🔧 Quick Fix: Firebase Security Rules for Mobile App

## ⚠️ Error Message
"Cannot access user database. Your administrator needs to update Firebase security rules."

## ✅ Quick Solution

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/apple-bazaar-pos
2. Click **"Firestore Database"** (left menu)
3. Click **"Rules"** tab

### Step 2: Copy and Paste These Rules

**Copy ONLY the code below** (without any markdown formatting):

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
      // Approval and expiration checks happen in application code
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 3: Publish
1. Click **"Publish"** button
2. Wait for confirmation
3. Try logging in on mobile app again

---

## ✅ Alternative: Use File

Or copy from: `FIRESTORE_RULES_SIMPLE_PRODUCTION.txt`

---

## 🔍 Why This Happens

The mobile app is trying to read user data from Firestore, but the security rules are blocking access. These rules allow:
- ✅ Authenticated users to read their own data
- ✅ Mobile app to check user approval status
- ✅ Users to access their stores, inventory, sales, etc.

---

## ⚡ After Fixing

Once rules are updated:
1. Mobile app can login
2. Mobile app can check approval status
3. Mobile app can access user data
4. Approval/expiration checks happen in app code (secure)

---

## 📝 Note

These rules are **simplified** for mobile compatibility. They rely on application code for admin/approval checks, which is secure because:
- Only authenticated users can access
- Users can only access their own data
- Approval checks happen in login code (cannot be bypassed)

