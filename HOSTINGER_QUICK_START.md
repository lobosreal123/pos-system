# 🚀 Hostinger Quick Start Guide

## Quick Deployment Steps

### 1. Build Your App
```bash
npm run build:hostinger
```
or
```bash
npm run build
```

### 2. Upload to Hostinger

**Files to upload from `dist` folder:**
- ✅ `index.html`
- ✅ `.htaccess` (IMPORTANT - enables routing)
- ✅ `assets/` folder (all files inside)

**Upload location:** `public_html` folder in Hostinger File Manager

### 3. Test Your Site
Visit: `https://yourdomain.com`

---

## ⚠️ Important Checklist

- [ ] `.htaccess` file is uploaded (enables React Router)
- [ ] All files from `dist` folder are uploaded
- [ ] SSL/HTTPS is enabled in Hostinger
- [ ] Default passwords are changed
- [ ] Firebase connection is working

---

## 📁 File Structure After Upload

Your `public_html` should contain:
```
public_html/
├── .htaccess
├── index.html
└── assets/
    ├── index-*.js
    ├── vendor-*.js
    ├── charts-*.js
    └── index-*.css
```

---

## 🔧 Troubleshooting

**404 errors on page refresh?**
→ Make sure `.htaccess` is uploaded to root

**Blank page?**
→ Check browser console for errors
→ Verify all asset files uploaded

**Need help?**
→ See `HOSTINGER_DEPLOYMENT.md` for detailed guide

---

**Ready to deploy?** Run `npm run build:hostinger` and upload! 🎉

