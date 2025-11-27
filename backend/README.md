# Kirana Store - Backend

The backend for the Kirana Store application, built with Node.js, Express, and MongoDB. It provides a robust API for managing products, orders, users, and a smart chatbot.

## 🚀 Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Caching**: Redis (for product caching)
-   **Authentication**: JWT (JSON Web Tokens)
-   **Security**: Helmet, Express Rate Limit, Bcrypt
-   **Email**: Nodemailer (Generic SMTP / Ethereal)

## 🛠️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the `backend` directory with the following:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/kirana_store
    JWT_SECRET=your_jwt_secret
    REDIS_URI=redis://localhost:6379
    
    # Email Configuration (Optional - Defaults to Ethereal)
    # SMTP_HOST=smtp.gmail.com
    # SMTP_PORT=587
    # SMTP_EMAIL=your_email
    # SMTP_PASSWORD=your_password
    ```

3.  **Run the Server**
    ```bash
    # Development (with Nodemailer)
    npm run dev
    
    # Production
    npm start
    ```

## 📚 API Endpoints

### Authentication
-   `POST /api/auth/register` - Register a new user (Customer/Owner)
-   `POST /api/auth/login` - Login and get token
-   `POST /api/auth/forgot-password` - Request password reset
-   `PUT /api/auth/reset-password/:token` - Reset password

### Products
-   `GET /api/products` - Get all products (Cached via Redis)
-   `POST /api/products` - Add a new product (Owner only)
-   `PUT /api/products/:id` - Update a product (Owner only)
-   `DELETE /api/products/:id` - Delete a product (Owner only)

### Orders
-   `POST /api/orders` - Place a new order
-   `GET /api/orders` - Get user's orders
-   `GET /api/orders/all` - Get all orders (Owner only)
-   `PUT /api/orders/:id/status` - Update order status (Owner only)

### Chatbot
-   `POST /api/chat` - Send message to bot (Context-aware)
-   `GET /api/chat/history` - Get chat history

### User Profile
-   `GET /api/users/profile` - Get profile details
-   `PUT /api/users/profile` - Update profile

## ✨ Key Features
-   **Role-Based Access Control (RBAC)**: Separate routes for Customers and Owners.
-   **Smart Chatbot**: Context-aware bot for checking prices, stock, and order status.
-   **Redis Caching**: High-performance product retrieval.
-   **Secure**: Rate limiting and security headers enabled.
