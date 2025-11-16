# 🍽️ Food Ordering Platform

A modern full-stack food ordering platform built with React.js and Node.js, featuring a smooth UI, category-based menu browsing, online ordering, franchise applications, catering inquiries, and a responsive design for all devices.

## ✨ Features

### Frontend Features
- 🎨 **Modern UI/UX** - Clean, responsive design with smooth animations
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- 🍛 **Category-Based Menu** - Browse menu items by categories (Biryani, Curries, Appetizers, etc.)
- 🛒 **Shopping Cart** - Add items to cart with quantity management
- 👤 **User Authentication** - Secure login and registration system
- 📋 **Order Management** - View past orders and order history
- 🏢 **Franchise Applications** - Submit franchise inquiries with form validation
- 🎉 **Catering Services** - Dedicated catering menu and inquiry system
- 📧 **Contact Forms** - Multiple contact forms with email integration
- 🔗 **UberEats Integration** - Direct redirect to UberEats for seamless ordering
- 🔔 **Toast Notifications** - User-friendly notifications for all actions
- ⚡ **Fast Performance** - Optimized for speed and smooth user experience

### Backend Features
- 🔐 **JWT Authentication** - Secure user authentication with JSON Web Tokens
- 📦 **Order Management** - Complete order processing and tracking system
- 📧 **Email Integration** - Automated emails for:
  - Contact form submissions
  - Franchise applications
  - Order confirmations
- 🗄️ **MongoDB Database** - Scalable database for users and orders
- 🛡️ **Password Hashing** - Secure password storage with bcrypt
- 🔒 **Protected Routes** - Middleware for route protection

## 🚀 Tech Stack

### Frontend
- **React.js** (v19.0.0) - UI library
- **React Router** (v7.3.0) - Client-side routing
- **Axios** (v1.8.2) - HTTP client
- **React Icons** (v5.5.0) - Icon library
- **CSS3** - Styling with modern features

### Backend
- **Node.js** - Runtime environment
- **Express.js** (v4.21.2) - Web framework
- **MongoDB** with **Mongoose** (v8.12.1) - Database and ODM
- **JWT** (v9.0.2) - Authentication
- **Bcryptjs** (v2.4.3) - Password hashing
- **Nodemailer** (v6.9.1) - Email service
- **CORS** (v2.8.5) - Cross-origin resource sharing

## 📁 Project Structure

```
food-app/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User model
│   │   └── Order.js         # Order model
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── orders.js        # Order routes
│   ├── server.js            # Express server setup
│   └── package.json         # Backend dependencies
│
├── frontend/
│   ├── public/
│   │   ├── images/          # Static images
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Cart.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── MenuItem.js
│   │   │   ├── PastOrders.js
│   │   │   └── Toast.js
│   │   ├── Pages/           # Page components
│   │   │   ├── Home.js
│   │   │   ├── Menu.js
│   │   │   ├── Order.js
│   │   │   ├── Franchise.js
│   │   │   ├── Catering.js
│   │   │   ├── Contact.js
│   │   │   └── Footer.js
│   │   ├── context/
│   │   │   └── ToastContext.js
│   │   ├── data/
│   │   │   └── menuData.js  # Menu items and categories
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json         # Frontend dependencies
│
└── README.md                # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/food-app
   JWT_SECRET=your-super-secret-jwt-key-here
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   NODE_ENV=development
   ```

4. **Start the backend server**
   ```bash
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```

   The backend server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** in the frontend directory (if needed):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## 🔑 Environment Variables

### Backend `.env` File

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/food-app` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `your-app-password` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Gmail App Password Setup

To use Gmail for sending emails:

1. Enable 2-Step Verification on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use this password in `EMAIL_PASS`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Orders
- `POST /api/orders` - Create a new order (Protected)
- `GET /api/orders` - Get all orders for authenticated user (Protected)
- `GET /api/orders/:id` - Get specific order (Protected)
- `POST /api/orders/send-order-confirmation` - Send order confirmation email

### Contact & Forms
- `POST /send-email` - Submit contact form
- `POST /api/franchise-apply` - Submit franchise application

## 🎯 Usage

### For Users
1. **Browse Menu** - Visit the Menu page to see all available items organized by categories
2. **Add to Cart** - Click on any menu item to add it to your cart
3. **View Cart** - Click the cart icon in the navbar to view and manage your cart
4. **Place Order** - Go to Order page, fill in delivery details, and place your order
5. **Track Orders** - View your order history in the dashboard (coming soon)

### For Administrators
- Monitor orders through the database
- Receive email notifications for:
  - New contact form submissions
  - Franchise applications
  - New orders

## 🎨 Customization

### Menu Items
Edit `frontend/src/data/menuData.js` to add, remove, or modify menu items and categories.

### Styling
- Global styles: `frontend/src/index.css`
- Component styles: Individual `.css` files in each component directory
- App-wide styles: `frontend/src/App.css`

### Email Templates
Modify email templates in:
- `backend/server.js` - Contact and franchise emails
- `backend/routes/orders.js` - Order confirmation emails

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Deploy to platforms like:
   - Heroku
   - Railway
   - Render
   - AWS EC2
   - DigitalOcean

### Frontend Deployment
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

### Environment Variables in Production
Make sure to set all environment variables in your hosting platform's dashboard.

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- CORS configuration
- Input validation
- Secure environment variable handling

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px and up)
- 📱 Tablets (768px and up)
- 💻 Desktops (1024px and up)
- 🖥️ Large screens (1440px and up)

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Check your `MONGODB_URI` in `.env`
- **Email Not Sending**: Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- **Port Already in Use**: Change `PORT` in `.env` or kill the process using the port

### Frontend Issues
- **API Connection Error**: Ensure backend is running and `REACT_APP_API_URL` is correct
- **Build Errors**: Clear `node_modules` and reinstall dependencies
- **Routing Issues**: Ensure you're using React Router correctly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ for authentic food ordering experience

## 🔮 Future Enhancements

See `PROFESSIONAL_IMPROVEMENTS.md` for a comprehensive list of planned improvements including:
- Payment integration (Stripe, PayPal)
- Real-time order tracking
- Reviews and ratings system
- Loyalty program
- PWA features
- Dark mode
- Multi-language support

---

**Happy Ordering! 🍽️**

