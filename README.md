# 🏪 Kirana Store - Single-Tenant E-Commerce Platform

A modern, full-stack e-commerce solution designed for individual Kirana (grocery) stores. Each deployment serves a single store with complete admin control, customer management, and integrated payment processing.

## ✨ Features

### 🔐 Admin Features
- **Admin Authentication** - Dedicated admin login with role-based access
- **Inventory Management** - Add, edit, delete products with image uploads
- **Order Management** - Track and update order status
- **Walk-in Sales** - Cash payment support with immediate stock deduction
- **Udhaar (Credit) Management** - Track customer credit/payments
- **Dashboard** - Overview of sales, orders, and inventory

### 🛒 Customer Features
- **Product Browsing** - Search, filter, and sort products
- **Shopping Cart** - Add/remove items with quantity control
- **Multiple Payment Options**:
  - Online payment (Razorpay)
  - Cash payment (admin only)
  - Credit/Udhaar (pay later)
- **Order Tracking** - View order history and status
- **Chat Support** - Interactive chatbot for product queries
- **Profile Management** - Update personal information

### ⚡ Performance
- **Redis Caching** - 50x faster product loading
- **Optimized Queries** - Efficient database operations
- **Image CDN** - Cloudinary integration for fast image delivery
- **Compression** - Gzip compression for faster page loads

### 🔒 Security
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Rate Limiting** - Protection against brute force
- **Helmet.js** - Security headers
- **CORS** - Controlled cross-origin requests

## 🚀 Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Atlas) - Database
- **Redis** - Caching layer
- **Cloudinary** - Image storage
- **Razorpay** - Payment gateway
- **Nodemailer** - Email service

### Frontend
- **React** (v19) + **Vite**
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Lucide React** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Redis Cloud account (optional but recommended)
- Cloudinary account
- Razorpay account

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
node seedAdmin.js
node seedProducts.js  # Optional: Add sample products
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
REDIS_URI=redis://...
FRONTEND_URL=http://localhost:5174

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

ADMIN_EMAIL=admin@yourstore.com
ADMIN_PASSWORD=SecurePassword123!
ADMIN_NAME=Your Store Name
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_...
VITE_STORE_NAME=My Kirana Store
```

## 📖 Usage

### Admin Access
1. Navigate to `/admin`
2. Login with admin credentials (from .env)
3. Access Dashboard, Inventory, Orders, Udhaar

### Customer Flow
1. Browse products on home page
2. Add items to cart
3. Checkout with preferred payment method
4. Track orders in "My Orders"

### Walk-in Sales
1. Admin adds products to cart
2. Selects "Pay via Cash" at checkout
3. Stock is deducted immediately
4. Order marked as completed

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

**Recommended Platforms:**
- **Backend**: Render, Railway
- **Frontend**: Vercel, Netlify
- **Database**: MongoDB Atlas
- **Redis**: Redis Cloud, Upstash

## 📁 Project Structure

```
Kirana Store/
├── backend/
│   ├── config/          # Database & Redis config
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & validation
│   ├── utils/           # Helper functions
│   ├── seedAdmin.js     # Admin user seeder
│   └── seedProducts.js  # Sample products seeder
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Route pages
│   │   └── api.js       # Axios config
│   └── public/          # Static assets
└── DEPLOYMENT_GUIDE.md
```

## 🔑 Key Concepts

### Single-Tenant Architecture
- Each deployment = One store
- No multi-tenant complexity
- Complete data isolation
- Customizable per store

### Role-Based Access
- **Admin**: Full control (inventory, orders, udhaar)
- **Customer**: Shopping and order tracking

### Payment Flow
- **Online**: Razorpay → Verify → Create Order
- **Cash**: Admin only → Immediate stock deduction
- **Credit**: Create order + credit ledger entry

## 🛠️ Scripts

```bash
# Backend
npm start              # Production server
npm run dev            # Development with nodemon
node seedAdmin.js      # Create admin user
node seedProducts.js   # Add sample products

# Frontend
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register customer
- `POST /api/auth/login` - Login (customer/admin)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (cached)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get orders (filtered by role)
- `PUT /api/orders/:id/status` - Update status (admin)
- `DELETE /api/orders/:id` - Delete order (admin)

### Credits (Udhaar)
- `POST /api/credits` - Add credit entry
- `GET /api/credits` - Get all credits (admin)
- `GET /api/credits/entries` - Get all entries (admin)
- `PUT /api/credits/:id` - Update entry (admin)
- `DELETE /api/credits/:id` - Delete entry (admin)

## 🤝 Contributing

This is a single-tenant application designed for individual store deployments. Fork and customize for your specific needs.

## 📄 License

MIT License - Feel free to use for your store!

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for Indian Kirana stores
- Supports local businesses going digital

---

**Made with ❤️ for Kirana Stores**
