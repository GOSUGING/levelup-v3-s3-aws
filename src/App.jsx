import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext.jsx';
import HeaderComponent from './components/HeaderComponent';
import HomePages from './pages/HomePages';
import ProductsPages from './pages/ProductsPages';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPages from './pages/RegisterPages';
import LoginPages from './pages/LoginPages';
import PurchasePages from './pages/PurchasePages';
import AdminPages from './pages/AdminPages.jsx';
import InventoryManagementPages from './pages/InventoryManagementPages.jsx';
import MarketManagementPages from './pages/MarketManagementPages.jsx';
import UserManagementPages from './pages/UserManagementPages.jsx';
import AddAdminPages from './pages/AddAdminPages.jsx';
import AddNewProduct from './pages/AddNewProduct.jsx';
import CouponsManagement from './pages/CouponsManagement.jsx';
import AddCoupon from './pages/AddCoupon.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Footer from './components/Footer';
import CategoriesPages from "./pages/CategoriesPages";
import PerfilPages from "./pages/ProfilePages";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PurchaseResult from './pages/PurchaseResult.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import ProfileOrders from './pages/ProfileOrders.jsx';




export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <HeaderComponent />
        <main className="App">
          <Routes>
            <Route path='/' element={<HomePages />} />
            <Route path='/categorias' element={<CategoriesPages />} />
            <Route path='/productos' element={<ProductsPages />} />
            <Route path='/productos/:id' element={<ProductDetailPage />} />
            <Route path='/registro' element={<RegisterPages />} />
            <Route path='/login' element={<LoginPages />} />
            <Route path='/pago' element={<PurchasePages />} />
            <Route path='/compra/:id' element={<PurchaseResult />} />
            <Route path='/perfil' element={<ProtectedRoute><PerfilPages /></ProtectedRoute>} />     
            <Route path="/perfil/pedidos" element={<ProtectedRoute><ProfileOrders /></ProtectedRoute>} />
            <Route path="/perfil/pedidos/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path='/admin' element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
            <Route path='/admin/inventario' element={<ProtectedRoute><InventoryManagementPages /></ProtectedRoute>} />
            <Route path='/admin/ventas' element={<ProtectedRoute><MarketManagementPages /></ProtectedRoute>} />
            <Route path='/admin/usuarios' element={<ProtectedRoute><UserManagementPages /></ProtectedRoute>} />
            <Route path='/admin/usuarios/nuevo' element={<ProtectedRoute><AddAdminPages /></ProtectedRoute>} />
            <Route path='/admin/productos/nuevo' element={<ProtectedRoute><AddNewProduct /></ProtectedRoute>} />
            <Route path='/admin/cupones' element={<ProtectedRoute><CouponsManagement /></ProtectedRoute>} />
            <Route path='/admin/cupones/nuevo' element={<ProtectedRoute><AddCoupon /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

console.log("REBUILD TEST v17: " + Math.random());


