# Database Seeding Scripts

This directory contains scripts to seed the database with initial data.

## Available Scripts

### 1. Seed Menu Data

Populates the database with menu items and categories from the static menu data.

**Usage:**
```bash
npm run seed:menu
```

Or directly:
```bash
node scripts/seedMenuData.js
```

**What it does:**
- Creates/updates all menu categories
- Creates/updates all menu items
- Handles duplicates (updates existing items instead of creating duplicates)
- Sets all items as available by default

**Note:** Make sure your `.env` file has the correct `MONGODB_URI` configured before running.

### 2. Create Admin User

Converts an existing user to admin role.

**Usage:**
```bash
node scripts/createAdmin.js <email>
```

**Example:**
```bash
node scripts/createAdmin.js admin@example.com
```

**What it does:**
- Finds a user by email
- Updates their role to "admin"
- Allows them to access admin dashboard

**Note:** The user must be registered first before running this script.

## Prerequisites

1. MongoDB must be running and accessible
2. `.env` file must be configured with `MONGODB_URI`
3. For admin script: User must be registered first

## Environment Setup

Make sure your `.env` file includes:
```env
MONGODB_URI=mongodb://localhost:27017/food-app
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-app
```

