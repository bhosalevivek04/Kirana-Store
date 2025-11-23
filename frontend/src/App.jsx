import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Udhaar from './pages/Udhaar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Chat from './pages/Chat';
import Orders from './pages/Orders';
import OrderManagement from './pages/OrderManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/orders" element={<Orders />} />

            {/* Owner Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="owner">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute role="owner">
                <Inventory />
              </ProtectedRoute>
            } />
            <Route path="/udhaar" element={
              <ProtectedRoute role="owner">
                <Udhaar />
              </ProtectedRoute>
            } />
            <Route path="/order-management" element={
              <ProtectedRoute role="owner">
                <OrderManagement />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
