# ☁️ Quick Cloudinary Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Sign up for Cloudinary (Free)
- Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
- Sign up with email or GitHub
- Free tier includes: **25GB storage, 25GB bandwidth/month**

### 2. Get Your Credentials
After signup, go to your **Dashboard**:
- Copy **Cloud Name** (e.g., `dabc123xyz`)
- Copy **API Key** (e.g., `123456789012345`)
- Copy **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### 3. Add to Backend `.env`
Open `backend/.env` and add:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Restart Your Backend Server
```bash
cd backend
npm start
```

You should see: `✅ Cloudinary configured - using cloud storage for images`

### 5. Test It!
1. Go to Admin Panel → Menu Management
2. Upload a new menu item image
3. Check the image URL in MongoDB - it should be a Cloudinary URL (starts with `https://res.cloudinary.com`)

---

## ✅ That's It!

- **New uploads** → Automatically go to Cloudinary
- **Old local images** → Still work (served from local storage)
- **No code changes needed** → Everything is automatic!

---

## 🔄 Migrate Existing Images (Optional)

If you want to migrate existing local images to Cloudinary:

```bash
cd backend
node scripts/migrateToCloudinary.js
```

This will:
- Find all menu items with local images (`/uploads/menu/...`)
- Upload them to Cloudinary
- Update the database with Cloudinary URLs
- Keep local files (you can delete them manually later)

---

## 🎯 How It Works

The app automatically detects which storage to use:

| Condition | Storage Used |
|-----------|-------------|
| Cloudinary credentials set | ☁️ **Cloudinary** |
| No Cloudinary credentials | 💾 **Local Storage** |

**Perfect for:**
- ✅ Development: Use local storage (no setup needed)
- ✅ Production: Use Cloudinary (just add credentials)

---

## 🐛 Troubleshooting

### "Cloudinary not configured" message
- Check your `.env` file has all 3 Cloudinary variables
- Make sure there are no typos
- Restart your server after adding variables

### Images still uploading locally
- Verify environment variables are loaded: `console.log(process.env.CLOUDINARY_CLOUD_NAME)`
- Check server logs for Cloudinary errors
- Make sure you restarted the server after adding variables

### Migration script fails
- Ensure Cloudinary credentials are set in `.env`
- Check MongoDB connection
- Verify local image files exist

---

## 📚 More Info

See `DEPLOYMENT_GUIDE.md` for:
- Full deployment instructions
- Platform-specific guides (Railway, Render, Heroku)
- Environment variable reference
- Production checklist

