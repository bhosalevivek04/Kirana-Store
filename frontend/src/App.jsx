import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Udhaar from './pages/Udhaar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Chat from './pages/Chat';
import Orders from './pages/Orders';
import OrderManagement from './pages/OrderManagement';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

import { CartProvider } from './context/CartContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <ToastContainer position="top-right" autoClose={3000} />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Customer Routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/orders" element={<Orders />} />

              {/* Admin Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute role="admin">
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute role="admin">
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/udhaar" element={
                <ProtectedRoute role="admin">
                  <Udhaar />
                </ProtectedRoute>
              } />
              <Route path="/order-management" element={
                <ProtectedRoute role="admin">
                  <OrderManagement />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
