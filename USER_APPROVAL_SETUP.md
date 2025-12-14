# User Approval System Setup Guide

## ✅ What's Been Implemented

1. **Firebase Authentication** - Email/password registration and login
2. **User Approval System** - New users require admin approval
3. **Registration Page** - Users can create accounts
4. **Pending Approval Page** - Shows when users are waiting for approval
5. **Admin Panel** - Manage and approve/reject users
6. **Protected Routes** - Only approved users can access the system

---

## 🔧 Firebase Console Setup Required

### Step 1: Enable Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/apple-bazaar-pos)
2. Click **"Authentication"** in the left menu
3. Click **"Get started"** (if not already enabled)
4. Click **"Sign-in method"** tab
5. Click **"Email/Password"**
6. Enable it and click **"Save"**

### Step 2: Update Firestore Security Rules

1. Go to **"Firestore Database"** → **"Rules"** tab
2. **Copy ONLY the code below** (without any markdown formatting):
   - Do NOT copy the ```javascript markers
   - Do NOT copy backticks
   - Copy from `rules_version` to the closing `}`

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
    
    // Users can access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admins can read all users for approval management
    match /users/{userId} {
      allow read: if isAdmin();
      allow write: if request.auth != null && request.auth.uid == userId;
      // Allow creation during registration (user creates their own document)
      allow create: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Or use the file:** `FIRESTORE_RULES_USER_APPROVAL.txt` (copy its contents)

3. Paste into the Firestore Rules editor
4. Click **"Publish"**

---

## 👤 Create Your First Admin User

### Option 1: Using Firebase Console (Recommended)

1. Go to **"Authentication"** → **"Users"** tab
2. Click **"Add user"**
3. Enter:
   - Email: your-admin-email@example.com
   - Password: (choose a strong password)
4. Click **"Add user"**
5. Copy the **User UID**

6. Go to **"Firestore Database"** → **"Data"** tab
7. Create a new document:
   - Collection: `users`
   - Document ID: (paste the User UID)
   - Fields:
     ```
     email: (string) your-admin-email@example.com
     name: (string) Admin
     role: (string) admin
     status: (string) approved
     createdAt: (timestamp) current date/time
     ```

### Option 2: Using Registration + Manual Approval

1. Register an account using the registration page
2. Go to Firebase Console → Firestore Database
3. Find the user document in `users` collection
4. Update:
   - `status`: `"approved"`
   - `role`: `"admin"`

---

## 🚀 How It Works

### Registration Flow

1. User registers with email/password
2. Account is created with `status: 'pending'`
3. User is automatically signed out
4. User sees success message with approval notice

### Login Flow

1. User tries to login
2. System checks if user is approved
3. If pending: Shows error message
4. If rejected: Shows rejection message
5. If approved: User can access the system

### Admin Approval Flow

1. Admin logs in
2. Goes to Admin Panel → Users tab
3. Sees "Pending Approval" tab with badge count
4. Can approve or reject users
5. Approved users can immediately login

---

## 📋 User Status Values

- **pending** - New registration, waiting for approval
- **approved** - Admin approved, can login and use system
- **rejected** - Admin rejected, cannot login

---

## 🔒 Security Notes

1. **Firestore Rules**: Make sure rules are updated (Step 2 above)
2. **Admin Access**: Only users with `role: 'admin'` can approve users
3. **Password Strength**: Firebase requires minimum 6 characters
4. **Email Validation**: Firebase validates email format automatically

---

## 🧪 Testing

1. **Test Registration:**
   - Go to `/register`
   - Create a test account
   - Should see success message

2. **Test Login (Pending User):**
   - Try to login with test account
   - Should see "pending approval" error

3. **Test Admin Approval:**
   - Login as admin
   - Go to Admin Panel → Users
   - Click "Pending Approval" tab
   - Approve the test user

4. **Test Approved Login:**
   - Login with approved test account
   - Should access dashboard successfully

---

## ⚠️ Important Notes

- **First Admin**: You must create the first admin manually in Firebase Console
- **Data Migration**: Existing localStorage users need to be migrated to Firebase
- **Email Uniqueness**: Each email can only be registered once
- **Password Reset**: Not yet implemented (can be added later)

---

## 🐛 Troubleshooting

### "User data not found" error
- User document doesn't exist in Firestore
- Create it manually or re-register

### "Missing or insufficient permissions"
- Firestore rules not updated
- Check rules match Step 2 above

### Can't see pending users
- Make sure you're logged in as admin
- Check user role in Firestore is `"admin"`

### Registration fails
- Check Firebase Authentication is enabled
- Check email format is valid
- Check password is at least 6 characters

---

## 📝 Next Steps (Optional Enhancements)

- [ ] Email notifications when user is approved
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Activity logging for approvals
- [ ] Bulk approve/reject actions

---

**Setup Complete!** 🎉

Your system now requires admin approval for new users.

