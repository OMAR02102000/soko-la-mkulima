import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerOrders from './pages/seller/SellerOrders';
import BrowseProducts from './pages/buyer/BrowseProducts';
import Cart from './pages/buyer/Cart';
import MyOrders from './pages/buyer/MyOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/home" element={
        <ProtectedRoute allowedRoles={['seller', 'buyer', 'admin']}><Home /></ProtectedRoute>
      } />

      <Route path="/seller/dashboard" element={
        <ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>
      } />
      <Route path="/seller/orders" element={
        <ProtectedRoute allowedRoles={['seller']}><SellerOrders /></ProtectedRoute>
      } />

      <Route path="/buyer/products" element={
        <ProtectedRoute allowedRoles={['buyer']}><BrowseProducts /></ProtectedRoute>
      } />
      <Route path="/buyer/cart" element={
        <ProtectedRoute allowedRoles={['buyer']}><Cart /></ProtectedRoute>
      } />
      <Route path="/buyer/orders" element={
        <ProtectedRoute allowedRoles={['buyer']}><MyOrders /></ProtectedRoute>
      } />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;