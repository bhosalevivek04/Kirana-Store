# Kirana Store - Frontend

The modern, responsive frontend for the Kirana Store, built with React and Vite. It offers a seamless shopping experience with a dedicated dashboard for store owners.

## 🚀 Tech Stack
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **HTTP Client**: Axios
-   **Routing**: React Router DOM

## 🛠️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file (if needed) or configure `vite.config.js` for proxy settings.
    *Default API URL*: `http://localhost:5000`

3.  **Run the App**
    ```bash
    npm run dev
    ```

## ✨ Key Features

### 🛍️ Customer Experience
-   **Product Search**: Instant search with suggestions (accessible to guests).
-   **Smart Chatbot**: Interactive chat for checking prices, stock, and tracking orders.
-   **Cart & Checkout**: Seamless flow with support for Cash on Delivery (Owner only for now) and Online Payment simulation.
-   **Order History**: Track past orders and their status.
-   **Profile Management**: Update personal details and password.

### 👨‍💼 Owner Dashboard
-   **Inventory Management**: Add, edit, and delete products.
-   **Order Management**: View all orders and update their status (Pending -> Delivered).
-   **Udhaar Khata**: Manage credit/debit for customers.
-   **Dashboard**: Quick overview of store performance.

### 📱 Responsive Design
-   **Mobile-First**: Optimized for all screen sizes.
-   **Adaptive UI**: Tables switch to cards on mobile for better readability.
-   **Touch-Friendly**: Easy-to-tap buttons and navigation.

## 📂 Project Structure
-   `/src/pages`: Main application pages (Home, Cart, Checkout, etc.)
-   `/src/components`: Reusable components (Navbar, Sidebar, ProductCard)
-   `/src/context`: Global state management (AuthContext)
