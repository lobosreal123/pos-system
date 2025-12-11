# GitHub Setup Guide

This guide will help you push your POS System code to GitHub and keep it updated.

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to [github.com](https://github.com)
2. Sign up for a free account
3. Verify your email

## Step 2: Create a New Repository on GitHub

1. Log in to GitHub
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `pos-system` (or any name you prefer)
4. Description: "Advanced POS System with IMEI Tracking"
5. Choose: **Public** (free) or **Private** (requires paid plan)
6. **DO NOT** check "Initialize with README" (we already have code)
7. Click **"Create repository"**

## Step 3: Initialize Git in Your Project

Open terminal and run these commands:

```bash
# Navigate to your project
cd /Users/macbook/pos-system

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: POS System with all features"

# Rename default branch to main (if needed)
git branch -M main
```

## Step 4: Connect to GitHub and Push

After creating the repository on GitHub, you'll see instructions. Use these commands:

```bash
# Add GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pos-system.git

# Push your code to GitHub
git push -u origin main
```

**Note:** You'll be asked for your GitHub username and password (or Personal Access Token).

---

## Step 5: Setting Up Authentication

GitHub no longer accepts passwords. You need a **Personal Access Token**:

### Create Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Give it a name: "POS System"
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Use Token When Pushing:

When you run `git push`, use:
- **Username:** Your GitHub username
- **Password:** Your Personal Access Token (not your GitHub password)

---

## Step 6: Making Updates and Pushing Changes

Whenever you make changes to your code, follow these steps:

```bash
# 1. Check what files changed
git status

# 2. Add changed files
git add .

# Or add specific files:
# git add src/pages/Dashboard.jsx

# 3. Commit with a descriptive message
git commit -m "Description of what you changed"

# Examples:
# git commit -m "Added circular chart to admin panel"
# git commit -m "Fixed currency formatting"
# git commit -m "Updated dashboard layout"

# 4. Push to GitHub
git push
```

---

## Quick Reference Commands

```bash
# Check status
git status

# See what changed
git diff

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to GitHub
git push

# Pull latest changes (if working on multiple computers)
git pull

# View commit history
git log --oneline
```

---

## Workflow Example

Here's a typical workflow when you make changes:

```bash
# 1. Make your code changes in the editor

# 2. Check what changed
git status

# 3. Stage all changes
git add .

# 4. Commit with message
git commit -m "Added new feature: payment status chart"

# 5. Push to GitHub
git push
```

---

## Troubleshooting

### If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/pos-system.git
```

### If you get authentication errors:
- Make sure you're using Personal Access Token, not password
- Check that token has "repo" scope enabled

### If you want to update from GitHub (pull changes):
```bash
git pull origin main
```

### To see your remote repository:
```bash
git remote -v
```

---

## Best Practices

1. **Commit often** - Don't wait too long between commits
2. **Write clear commit messages** - Describe what changed
3. **Test before pushing** - Make sure your code works
4. **Don't commit sensitive data** - Keep API keys, passwords out of code
5. **Use .gitignore** - Already set up to exclude node_modules, etc.

---

## Next Steps

After pushing to GitHub, you can:
- Share your repository with others
- Deploy directly from GitHub (Vercel, Netlify)
- Track issues and features
- Collaborate with team members

---

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics

