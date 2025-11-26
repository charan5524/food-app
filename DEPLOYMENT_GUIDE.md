# 🚀 Deployment Guide for Food App

This guide will help you deploy your food ordering application with proper image storage configuration.

## 📋 Table of Contents
1. [Image Storage Options](#image-storage-options)
2. [Cloudinary Setup (Recommended)](#cloudinary-setup-recommended)
3. [Environment Variables](#environment-variables)
4. [Deployment Platforms](#deployment-platforms)
5. [Migration from Local to Cloud Storage](#migration-from-local-to-cloud-storage)

---

## 🖼️ Image Storage Options

### Current Setup
- **Development**: Images stored locally in `backend/uploads/menu/`
- **Production**: Should use cloud storage (Cloudinary recommended)

### Why Cloud Storage?
- ✅ **Persistent**: Files survive server restarts and redeployments
- ✅ **Scalable**: Works with multiple server instances
- ✅ **CDN**: Faster image delivery worldwide
- ✅ **Automatic optimization**: Images are optimized automatically
- ✅ **Backup**: Images are automatically backed up

---

## ☁️ Cloudinary Setup (Recommended)

### Step 1: Create Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. After signup, you'll see your dashboard with credentials

### Step 2: Get Your Credentials
From your Cloudinary dashboard, copy:
- **Cloud Name** (e.g., `dabc123xyz`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz`)

### Step 3: Install Cloudinary Package
```bash
cd backend
npm install cloudinary
```

### Step 4: Configure Environment Variables
Add these to your `.env` file in the `backend` folder:

```env
# Cloudinary Configuration (for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 5: How It Works
- **If Cloudinary is configured**: Images upload to Cloudinary automatically
- **If Cloudinary is NOT configured**: Falls back to local storage (for development)

The app automatically detects which storage method to use based on environment variables.

---

## 🔐 Environment Variables

### Backend `.env` File
```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-app

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Email (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env` File
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## 🌐 Deployment Platforms

### Option 1: Railway (Recommended for Backend)
**Why Railway?**
- Easy MongoDB integration
- Automatic deployments from GitHub
- Free tier available
- Environment variables management

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add MongoDB service
4. Set all environment variables
5. Deploy!

**Note**: Railway has ephemeral file system, so **Cloudinary is required**.

### Option 2: Render
**Steps:**
1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `cd backend && npm install && npm start`
5. Set start command: `node backend/server.js`
6. Add environment variables
7. Deploy!

**Note**: Render also has ephemeral file system, so **Cloudinary is required**.

### Option 3: Heroku
**Steps:**
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add MongoDB: `heroku addons:create mongolab`
5. Set environment variables: `heroku config:set KEY=value`
6. Deploy: `git push heroku main`

**Note**: Heroku has ephemeral file system, so **Cloudinary is required**.

### Option 4: AWS EC2 / DigitalOcean
**Steps:**
1. Create a virtual server (Ubuntu recommended)
2. Install Node.js and MongoDB
3. Clone your repository
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt

**Note**: With persistent storage, you can use local storage OR Cloudinary.

### Frontend Deployment

#### Option 1: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set output directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL`
6. Deploy!

#### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com)
2. Import GitHub repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL`
6. Deploy!

---

## 🔄 Migration from Local to Cloud Storage

If you have existing images in local storage and want to migrate to Cloudinary:

### Option 1: Manual Migration Script
Create `backend/scripts/migrateToCloudinary.js`:

```javascript
const mongoose = require("mongoose");
const MenuItem = require("../models/Menu");
const cloudStorage = require("../utils/cloudStorage");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const migrateImages = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const menuItems = await MenuItem.find({
      image: { $regex: "^/uploads/" }
    });

    console.log(`Found ${menuItems.length} items with local images`);

    for (const item of menuItems) {
      if (item.image && item.image.startsWith("/uploads/")) {
        const imagePath = path.join(__dirname, "..", item.image);
        
        if (fs.existsSync(imagePath)) {
          console.log(`Uploading ${item.name}...`);
          const fileBuffer = fs.readFileSync(imagePath);
          const cloudUrl = await cloudStorage.uploadToCloudinary(fileBuffer, "menu");
          
          item.image = cloudUrl;
          await item.save();
          
          // Optionally delete local file
          // fs.unlinkSync(imagePath);
          
          console.log(`✅ Migrated: ${item.name} -> ${cloudUrl}`);
        }
      }
    }

    console.log("✅ Migration complete!");
    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

migrateImages();
```

Run it:
```bash
cd backend
node scripts/migrateToCloudinary.js
```

### Option 2: Gradual Migration
- New uploads will automatically go to Cloudinary
- Old images will continue to work from local storage
- Migrate old images gradually as needed

---

## ✅ Pre-Deployment Checklist

- [ ] Set up Cloudinary account and get credentials
- [ ] Add Cloudinary environment variables to `.env`
- [ ] Test image uploads locally with Cloudinary
- [ ] Set all required environment variables in deployment platform
- [ ] Test backend API endpoints
- [ ] Build and test frontend locally
- [ ] Set `REACT_APP_API_URL` in frontend environment
- [ ] Test full flow: upload image → view on menu → order
- [ ] Set up MongoDB Atlas (if not using Railway's MongoDB)
- [ ] Configure CORS with production frontend URL
- [ ] Set up SSL/HTTPS for both frontend and backend
- [ ] Test payment integration with Stripe (use test keys first)

---

## 🐛 Troubleshooting

### Images not uploading to Cloudinary
- Check environment variables are set correctly
- Verify Cloudinary credentials in dashboard
- Check server logs for error messages

### Images not displaying
- Verify `REACT_APP_API_URL` is set correctly in frontend
- Check CORS configuration includes frontend URL
- Verify image URLs in database are correct

### Local storage vs Cloudinary
- The app automatically uses Cloudinary if credentials are provided
- If Cloudinary credentials are missing, it falls back to local storage
- Check server startup logs to see which storage is being used

---

## 📞 Support

If you encounter issues:
1. Check server logs for error messages
2. Verify all environment variables are set
3. Test Cloudinary connection separately
4. Check CORS and security headers configuration

---

## 🎉 You're Ready to Deploy!

Once you've completed the setup:
1. Push your code to GitHub
2. Deploy backend to Railway/Render/Heroku
3. Deploy frontend to Vercel/Netlify
4. Test everything works end-to-end
5. Celebrate! 🎊

