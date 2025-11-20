# 📊 Database Seeding Guide

This guide explains how to populate your database with menu data.

## 🚀 Quick Start

### Step 1: Ensure MongoDB is Running

Make sure your MongoDB database is running and accessible. Check your `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/food-app
```

### Step 2: Navigate to Backend Directory

```bash
cd backend
```

### Step 3: Run the Seeding Script

```bash
npm run seed:menu
```

That's it! The script will:
- ✅ Connect to your MongoDB database
- ✅ Create/update all menu categories
- ✅ Create/update all menu items
- ✅ Show you a summary of what was created/updated

## 📋 What Gets Seeded

### Categories (9 total)
- Biryani 🍛
- Rice Dishes 🍚
- Curries 🍲
- Appetizers 🥟
- Vegetable Dishes 🥬
- Non-Veg Dry Items 🍗
- Breads 🍞
- Desserts 🍰
- Beverages 🥤

### Menu Items (15 total)
- 3 Biryani items
- 3 Curry items
- 3 Appetizer items
- 2 Bread items
- 2 Dessert items
- 2 Beverage items

## 🔄 Updating Menu Data

The script is **idempotent**, meaning you can run it multiple times safely:

- **If an item exists**: It will be **updated** with new data
- **If an item doesn't exist**: It will be **created**

So if you modify the menu data in `backend/scripts/seedMenuData.js` and run the script again, all items will be updated!

## 📝 Modifying Menu Data

To add or modify menu items:

1. Open `backend/scripts/seedMenuData.js`
2. Edit the `menuItems` array
3. Run `npm run seed:menu` again

### Example: Adding a New Item

```javascript
{
  name: "Mutton Biryani",
  description: "Tender mutton pieces with aromatic basmati rice",
  price: 19.99,
  category: "Biryani",
  image: "https://example.com/image.jpg",
  popular: true,
  available: true,
}
```

## 🛠️ Troubleshooting

### Error: "MONGODB_URI is not set"
- Make sure you have a `.env` file in the `backend` directory
- Check that `MONGODB_URI` is set correctly

### Error: "MongoDB connection error"
- Verify MongoDB is running
- Check your connection string
- For MongoDB Atlas, ensure your IP is whitelisted

### Items not showing up in frontend
- Make sure the backend server is running
- Check that items have `available: true`
- Clear browser cache and refresh

## 📊 Verifying Data

After seeding, you can verify the data:

1. **Using MongoDB Compass** (GUI):
   - Connect to your database
   - Check the `menuitems` and `categories` collections

2. **Using Admin Dashboard**:
   - Login to admin panel
   - Go to Menu Management
   - You should see all seeded items

3. **Using API**:
   ```bash
   curl http://localhost:5000/api/menu
   ```

## 🎯 Next Steps

After seeding:
1. ✅ Start your backend server: `npm run dev`
2. ✅ Start your frontend: `cd ../frontend && npm start`
3. ✅ Visit the Menu page to see your items
4. ✅ Use Admin Dashboard to manage items

## 💡 Tips

- Run the script whenever you want to reset menu data to defaults
- The script preserves existing items and only updates them
- All items are set as `available: true` by default
- Popular items are marked with `popular: true`

---

**Need Help?** Check the `backend/scripts/README.md` for more details.

