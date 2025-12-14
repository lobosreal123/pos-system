# Hostinger Deployment Guide

Complete guide to deploy your POS System to Hostinger web hosting.

## 📋 Prerequisites

- Hostinger hosting account (any plan)
- Access to File Manager or FTP client
- Domain name connected to your Hostinger account

---

## 🚀 Step-by-Step Deployment

### Step 1: Build Your Application

First, build your React app for production:

```bash
cd /Users/macbook/pos-system
npm run build
```

This creates an optimized `dist` folder with all production files.

**✅ Verify the build:**
- Check that the `dist` folder was created
- Ensure `dist/index.html` exists
- Check that `dist/assets/` folder contains JavaScript and CSS files

---

### Step 2: Access Hostinger File Manager

1. **Login to Hostinger:**
   - Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
   - Login with your Hostinger credentials

2. **Open File Manager:**
   - Click on **"File Manager"** in the control panel
   - Navigate to your domain's root directory
   - Usually: `public_html` or `www` folder

---

### Step 3: Upload Files

**Option A: Using File Manager (Recommended)**

1. **Clear existing files (if any):**
   - Select all files in `public_html` (if deploying fresh)
   - Delete them (keep a backup if needed)

2. **Upload the dist folder contents:**
   - In File Manager, click **"Upload"** button
   - Select ALL files from your local `dist` folder:
     - `index.html`
     - `assets/` folder (with all JS, CSS files)
     - `.htaccess` file (from `public/.htaccess`)

3. **Upload .htaccess file:**
   - Make sure `.htaccess` is uploaded to the root (`public_html`)
   - This file is crucial for React Router to work properly
   - If you don't see it, enable "Show hidden files" in File Manager

**Option B: Using FTP Client (FileZilla, WinSCP, etc.)**

1. **Get FTP credentials:**
   - In Hostinger hPanel, go to **"FTP Accounts"**
   - Note your FTP host, username, and password

2. **Connect via FTP:**
   - Host: `ftp.yourdomain.com` or IP address
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

3. **Upload files:**
   - Navigate to `public_html` folder
   - Upload all contents from `dist` folder
   - Upload `.htaccess` file

---

### Step 4: Verify File Structure

Your `public_html` folder should look like this:

```
public_html/
├── .htaccess          (Important for routing!)
├── index.html
├── assets/
│   ├── index-*.js
│   ├── vendor-*.js
│   ├── charts-*.js
│   └── index-*.css
└── _redirects (optional, for Netlify compatibility)
```

---

### Step 5: Test Your Website

1. **Visit your domain:**
   - Open your browser
   - Go to `https://yourdomain.com`
   - The app should load

2. **Test routing:**
   - Try navigating to different pages (e.g., `/pos`, `/sales`)
   - All routes should work without 404 errors
   - If you get 404 errors, check that `.htaccess` is uploaded correctly

3. **Test functionality:**
   - Login with default credentials:
     - Admin: `admin` / `admin123`
     - Cashier: `cashier` / `cashier123`
   - Test POS features
   - Verify Firebase connection works

---

## 🔧 Troubleshooting

### Issue: 404 Error on Page Refresh

**Problem:** React Router routes return 404 when refreshing the page.

**Solution:**
- Ensure `.htaccess` file is uploaded to `public_html` root
- Check that mod_rewrite is enabled (usually enabled by default on Hostinger)
- Verify `.htaccess` file permissions (should be 644)

### Issue: White Screen / Blank Page

**Possible causes:**
1. **JavaScript errors:**
   - Open browser console (F12)
   - Check for error messages
   - Verify all asset files uploaded correctly

2. **Base path issues:**
   - Check that assets are loading (Network tab in DevTools)
   - Verify file paths in `index.html` are correct

3. **Firebase configuration:**
   - Ensure Firebase config is correct
   - Check browser console for Firebase errors

### Issue: Files Not Uploading

**Solution:**
- Check file permissions (should be 644 for files, 755 for folders)
- Verify you have write permissions in `public_html`
- Try uploading via FTP if File Manager fails

### Issue: Slow Loading

**Solution:**
- Enable GZIP compression (usually enabled by default)
- Check `.htaccess` compression settings
- Consider using Hostinger's CDN if available

---

## 🔒 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Change default cashier password
- [ ] Enable HTTPS/SSL (Hostinger provides free SSL)
- [ ] Review Firebase security rules
- [ ] Set up regular backups
- [ ] Consider adding rate limiting

---

## 📝 Important Notes

### Firebase Configuration

Your app uses Firebase for data storage. Make sure:
- Firebase project is set up correctly
- Firestore security rules are configured
- Firebase config in `src/config/firebase.js` is correct

### Data Storage

- Data is stored in Firebase Firestore (cloud)
- Accessible from any device with login credentials
- Real-time synchronization enabled

### Updates & Maintenance

**To update your website:**

1. Make changes to your code locally
2. Run `npm run build` again
3. Upload new files to Hostinger (replace old ones)
4. Clear browser cache if needed

**Recommended:**
- Use Git for version control
- Test changes locally before deploying
- Keep backups of previous versions

---

## 🎯 Quick Deployment Checklist

- [ ] Built production version (`npm run build`)
- [ ] Uploaded all files from `dist` folder
- [ ] Uploaded `.htaccess` file to root
- [ ] Verified file structure in `public_html`
- [ ] Tested website loads correctly
- [ ] Tested all routes work (no 404 errors)
- [ ] Tested login functionality
- [ ] Verified Firebase connection
- [ ] Changed default passwords
- [ ] Enabled SSL/HTTPS

---

## 📞 Need Help?

### Hostinger Support
- Live Chat: Available in hPanel
- Knowledge Base: [hostinger.com/tutorials](https://www.hostinger.com/tutorials)
- Support Email: Check your Hostinger account

### Common Hostinger Features
- **Free SSL:** Enable in hPanel → SSL section
- **CDN:** Available in some plans
- **Backups:** Automatic backups available
- **PHP Version:** Usually PHP 8.0+ (not needed for React app)

---

## 🎉 Success!

Once deployed, your POS System will be:
- ✅ Accessible from anywhere
- ✅ Secure with HTTPS
- ✅ Fast and optimized
- ✅ Ready for production use

**Your website URL:** `https://yourdomain.com`

---

## 🔄 Future Updates

To update your website:

```bash
# 1. Make changes to your code
# 2. Build again
npm run build

# 3. Upload new dist folder contents to Hostinger
# 4. Replace old files in public_html
```

That's it! Your POS System is now live on Hostinger! 🚀

