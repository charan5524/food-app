# 🔧 Port Configuration Guide - Complete Code Changes

## For Backend Port 8000 & Frontend Port 8001

**Date:** $(date)  
**Configuration:** Backend `.env` only (No frontend `.env`)

---

## 📋 Executive Summary

This guide documents **ALL** code files that need to be modified when using:

- **Backend Port:** 8000
- **Frontend Port:** 8001
- **Setup:** Backend `.env` file only (no frontend `.env`)

**Total Files to Modify:** 5 files  
**Total Lines to Change:** 5 lines

---

## ✅ Checklist

- [ ] `backend/server.js` - 2 changes (Line 24, Line 106)
- [ ] `frontend/src/services/api.js` - 1 change (Line 5)
- [ ] `frontend/src/Pages/AdminRegister.js` - 1 change (Line 35)
- [ ] `frontend/src/components/admin/MenuManagement.js` - 1 change (Line 126)
- [ ] `backend/controllers/contactController.js` - 1 change (Line 903)

---

## 📁 File-by-File Changes

### 1. Backend Server Configuration

**File:** `backend/server.js`  
**Purpose:** Server port and CORS configuration

#### Change 1.1: CORS Frontend URL (Line 24)

**Location:** Line 24  
**Current Code:**

```javascript
origin: process.env.FRONTEND_URL || "http://localhost:3000",
```

**Change To:**

```javascript
origin: process.env.FRONTEND_URL || "http://localhost:8001",
```

**Reason:** Frontend runs on port 8001, not 3000

---

#### Change 1.2: Server Port Fallback (Line 106)

**Location:** Line 106  
**Current Code:**

```javascript
const PORT = process.env.PORT || 5000;
```

**Change To:**

```javascript
const PORT = process.env.PORT || 8000;
```

**Reason:** Backend runs on port 8000, not 5000 (fallback if .env not loaded)

---

### 2. Frontend API Service

**File:** `frontend/src/services/api.js`  
**Purpose:** API base URL configuration

#### Change 2.1: API Base URL (Line 5)

**Location:** Line 5  
**Current Code:**

```javascript
baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
```

**Change To:**

```javascript
baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
```

**Reason:** Connects frontend to backend on port 8000 (used for all API calls: login, register, orders, etc.)

---

### 3. Admin Registration Page

**File:** `frontend/src/Pages/AdminRegister.js`  
**Purpose:** Admin registration endpoint

#### Change 3.1: Admin Registration API URL (Line 35)

**Location:** Line 35  
**Current Code:**

```javascript
`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/register-admin`,
```

**Change To:**

```javascript
`${process.env.REACT_APP_API_URL || "http://localhost:8000"}/api/auth/register-admin`,
```

**Reason:** Admin registration must connect to backend on port 8000

---

### 4. Menu Management Component

**File:** `frontend/src/components/admin/MenuManagement.js`  
**Purpose:** Menu image URLs

#### Change 4.1: Menu Image API URL (Line 126)

**Location:** Line 126  
**Current Code:**

```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

**Change To:**

```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
```

**Reason:** Menu images are served from backend, need correct port 8000

---

### 5. Contact Controller (Email Links)

**File:** `backend/controllers/contactController.js`  
**Purpose:** Frontend URL in email templates

#### Change 5.1: Email Template Frontend URL (Line 903)

**Location:** Line 903  
**Current Code:**

```javascript
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
```

**Change To:**

```javascript
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8001";
```

**Reason:** Email links should point to frontend on port 8001

---

## 🔍 Verification Steps

### Step 1: Verify Backend Configuration

1. Check `backend/.env` file contains:

   ```env
   PORT=8000
   FRONTEND_URL=http://localhost:8001
   ```

2. Start backend server:

   ```bash
   cd backend
   npm run dev
   ```

3. Verify output shows:

   ```
   🚀 Server running on port 8000
   ✅ Database: Connected
   ```

4. Test backend endpoint:
   ```
   Browser: http://localhost:8000/
   Expected: "Food App Backend is Running!"
   ```

---

### Step 2: Verify Frontend Configuration

1. Start frontend server:

   ```bash
   cd frontend
   npm start
   ```

2. Verify it runs on port 8001 (or default 3000 if not configured)

3. Open browser console (F12) → Network tab

4. Try login → Check API call URL:
   ```
   Expected: http://localhost:8000/api/auth/login
   ```

---

### Step 3: Test Login/Registration

1. Navigate to: `http://localhost:8001/login` (or `http://localhost:3000/login`)

2. Try to login/register

3. Check browser console:
   - ✅ Should see: `POST http://localhost:8000/api/auth/login` (200 OK)
   - ❌ If error: Check Network tab for actual URL being called

---

## 🐛 Troubleshooting

### Network Error on Login/Register

**Possible Causes:**

1. **Backend not running**

   - Solution: Start backend with `cd backend && npm run dev`
   - Check: Port 8000 is listening

2. **Wrong API URL in frontend**

   - Solution: Verify `frontend/src/services/api.js` line 5 is `http://localhost:8000`
   - Check: Browser console Network tab shows correct URL

3. **CORS error**

   - Solution: Verify `backend/server.js` line 24 has `http://localhost:8001`
   - Check: Backend console for CORS errors

4. **Port conflict**

   - Solution: Check if port 8000 is already in use
   - Windows: `netstat -ano | findstr :8000`
   - Change PORT in `.env` if needed

5. **Frontend not restarted**
   - Solution: Stop frontend (Ctrl+C) and restart `npm start`
   - Reason: Code changes require restart

---

## 📊 Impact Analysis

### Files Affected by Port Changes

| File                                              | Lines Changed | Impact Level | Function                |
| ------------------------------------------------- | ------------- | ------------ | ----------------------- |
| `backend/server.js`                               | 2             | **CRITICAL** | Server startup & CORS   |
| `frontend/src/services/api.js`                    | 1             | **CRITICAL** | All API calls           |
| `frontend/src/Pages/AdminRegister.js`             | 1             | **MEDIUM**   | Admin registration only |
| `frontend/src/components/admin/MenuManagement.js` | 1             | **LOW**      | Menu images only        |
| `backend/controllers/contactController.js`        | 1             | **LOW**      | Email links only        |

### Critical Changes (Must Fix)

- ✅ `backend/server.js` - Server won't start correctly
- ✅ `frontend/src/services/api.js` - All API calls will fail

### Important Changes (Should Fix)

- ⚠️ `frontend/src/Pages/AdminRegister.js` - Admin registration will fail
- ⚠️ `frontend/.../MenuManagement.js` - Menu images won't load

### Nice-to-Have (Optional)

- ℹ️ `backend/controllers/contactController.js` - Email links may be wrong

---

## 🔄 Alternative: Using Frontend .env

If you prefer to use a frontend `.env` file instead of code changes:

### Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Then Only Change:

- `backend/server.js` (Line 24, Line 106)
- `backend/controllers/contactController.js` (Line 903)

### Files That DON'T Need Changes:

- `frontend/src/services/api.js` (uses env variable)
- `frontend/src/Pages/AdminRegister.js` (uses env variable)
- `frontend/src/components/admin/MenuManagement.js` (uses env variable)

**Recommendation:** Using frontend `.env` is cleaner and easier to maintain.

---

## 📝 Backend .env Template

**File:** `backend/.env`

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-app?retryWrites=true&w=majority

# JWT Secret Key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Server Port
PORT=8000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8001

# Node Environment
NODE_ENV=development

# App Name
APP_NAME=food app

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

---

## 🎯 Quick Reference: All Port Numbers

| Service          | Default Port | New Port | Environment Variable                |
| ---------------- | ------------ | -------- | ----------------------------------- |
| Backend Server   | 5000         | **8000** | `PORT` (backend/.env)               |
| Frontend Server  | 3000         | **8001** | (React default)                     |
| Frontend API URL | 5000         | **8000** | `REACT_APP_API_URL` (frontend/.env) |
| CORS Origin      | 3000         | **8001** | `FRONTEND_URL` (backend/.env)       |

---

## ✅ Final Checklist

Before sharing code with your friend:

- [ ] All 5 files modified with correct ports
- [ ] Backend `.env` file created with PORT=8000 and FRONTEND_URL=http://localhost:8001
- [ ] Tested backend starts on port 8000
- [ ] Tested frontend connects to backend (check Network tab)
- [ ] Tested login/registration works
- [ ] Tested admin registration works (if applicable)
- [ ] Tested menu images load correctly (if applicable)

---

## 📞 Support

If issues persist after making all changes:

1. **Check Backend Logs:**

   ```bash
   cd backend
   npm run dev
   ```

   Look for errors in terminal

2. **Check Frontend Console:**

   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

3. **Verify Ports:**

   - Backend: `http://localhost:8000/` should respond
   - Frontend: Runs on 8001 (or 3000 default)

4. **Common Issues:**
   - Port already in use → Change PORT in `.env`
   - CORS errors → Check FRONTEND_URL matches frontend port
   - Network errors → Verify backend is running

---

## 📄 Document Information

- **Version:** 1.0
- **Last Updated:** 2024
- **Configuration:** Backend .env only
- **Ports:** Backend 8000, Frontend 8001

---

**End of Configuration Guide**
