# Mobile App Debugging Guide

## Common Issues & Solutions

### Issue 1: "Cannot access user database" Error

**Possible Causes:**
1. Firestore rules not updated correctly
2. User not authenticated when trying to read
3. Trying to access data before login completes
4. Wrong Firebase project configuration

**Solution Steps:**

#### Step 1: Verify Firebase Project
Make sure your mobile app uses the SAME project:
- Project ID: `apple-bazaar-pos`
- Check in your mobile app's Firebase config

#### Step 2: Verify Rules Are Published
1. Go to Firebase Console → Firestore → Rules
2. Make sure rules are saved and published
3. Check for any syntax errors (red indicators)

#### Step 3: Check Authentication Flow
The error might happen if you're trying to read Firestore before authentication completes.

**Correct Flow:**
```javascript
// 1. First authenticate
const userCredential = await signInWithEmailAndPassword(auth, email, password)

// 2. THEN read Firestore (after auth is complete)
const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
```

**Wrong Flow:**
```javascript
// DON'T do this - reading before auth completes
const userDoc = await getDoc(doc(db, 'users', someUserId))
await signInWithEmailAndPassword(auth, email, password)
```

---

## 🔍 Debugging Checklist

### Check 1: Firebase Configuration
- [ ] Mobile app uses projectId: `apple-bazaar-pos`
- [ ] Firebase SDK is properly initialized
- [ ] Auth and Firestore are imported correctly

### Check 2: Authentication
- [ ] User is authenticated before reading Firestore
- [ ] `auth.currentUser` is not null when reading
- [ ] User UID matches the document path

### Check 3: Firestore Rules
- [ ] Rules are published (not just saved)
- [ ] No syntax errors in rules
- [ ] Rules allow authenticated users to read

### Check 4: Code Flow
- [ ] Login happens before reading user data
- [ ] Error handling catches Firestore permission errors
- [ ] User document exists in Firestore

---

## 📱 Mobile App Code to Check

Please share these parts of your mobile app code:

1. **Firebase Initialization:**
   - How you initialize Firebase
   - Your Firebase config

2. **Login Function:**
   - How you authenticate
   - When you try to read Firestore
   - Error handling

3. **Firestore Read:**
   - Where you read user data
   - The exact path you're trying to access

---

## 🛠️ Test Rules (Temporary - For Debugging Only)

If you want to test if rules are the issue, temporarily use these (ONLY for testing):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING:** These rules allow any authenticated user to read/write everything. Only use for testing, then switch back to secure rules!

---

## 📋 Share Your Code

Please share:
1. Your mobile app's Firebase initialization code
2. Your login function
3. Where you're trying to read the user document
4. The exact error message (if different from the screenshot)

This will help me identify the exact issue!

