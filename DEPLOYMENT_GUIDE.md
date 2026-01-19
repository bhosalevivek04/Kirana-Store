# Store Configuration Guide

This file contains environment variables for customizing your store.

## Backend (.env)
```env
# Store Information
STORE_NAME="Your Kirana Store Name"
STORE_LOCATION="Your Store Address"
STORE_PHONE="+91-9876543210"
STORE_EMAIL="yourstore@example.com"

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/your-store-db

# Redis Cache
REDIS_URI=redis://your-redis-url

# JWT Secret (keep this secure and unique per store)
JWT_SECRET=your_unique_secret_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5174

# MailerSend Configuration (Password Reset)
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxxxxxx
```

## Frontend (.env)
```env
# API URL (automatically determined, but can override)
VITE_API_URL=http://localhost:5000/api

# Store Branding (optional - can also use backend API)
VITE_STORE_NAME="Your Kirana Store Name"
```

## Deployment Checklist

### For Each New Store:

1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd kirana-store
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create .env file with store-specific values
   cp .env.example .env
   # Edit .env with store details
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   # Create .env file
   cp .env.example .env
   ```

4. **Create MongoDB Database**
   - Go to MongoDB Atlas
   - Create new database for this store
   - Copy connection string to backend .env

5. **Deploy Backend** (Render/Railway/Heroku)
   - Connect GitHub repo
   - Set environment variables
   - Deploy

6. **Deploy Frontend** (Vercel/Netlify)
   - Connect GitHub repo
   - Set VITE_API_URL to backend URL
   - Deploy

7. **Share with Store Owner**
   - Frontend URL: `https://yourstore.vercel.app`
   - Admin credentials
   - QR code for customers

## Custom Domain (Optional)

You can set up custom domains like:
- `www.sharmakirana.com`
- `gupta-store.in`

Configure in Vercel/Netlify settings.
