import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Footer from './components/common/Footer';
import Chatbot from './components/ai/Chatbot';
import Spinner from './components/common/Spinner';
import { AnimatePresence, motion } from 'framer-motion';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';
import { ProtectedRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Categories = lazy(() => import('./pages/Categories'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLayout = lazy(() => import('./layouts/admin/AdminLayout'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductCreate = lazy(() => import('./pages/admin/AdminProductCreate'));
const AdminProductEdit = lazy(() => import('./pages/admin/AdminProductEdit'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminAds = lazy(() => import('./pages/admin/AdminAds'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const SuperAdminControl = lazy(() => import('./pages/admin/SuperAdminControl'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Top Loading Progress Bar Component
const PageLoader = () => {
  useEffect(() => {
    nprogress.start();
    return () => nprogress.done();
  }, []);
  return <div className="flex justify-center mt-40"><Spinner /></div>;
};

// Animated Page Wrapper
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><Shop /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetails /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><ProtectedRoute><Checkout /></ProtectedRoute></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/wishlist" element={<PageTransition><ProtectedRoute><Wishlist /></ProtectedRoute></PageTransition>} />
        <Route path="/categories" element={<PageTransition><Categories /></PageTransition>} />
        <Route path="/order/:id" element={<PageTransition><ProtectedRoute><OrderDetails /></ProtectedRoute></PageTransition>} />
        
        {/* Admin Routes with Professional Layout */}
        <Route path="/admin" element={<PageTransition><AdminRoute><AdminLayout /></AdminRoute></PageTransition>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<AdminProductCreate />} />
          <Route path="products/edit/:id" element={<AdminProductEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminRoute requireSuperAdmin><AdminUsers /></AdminRoute>} />
          <Route path="control" element={<AdminRoute requireSuperAdmin><SuperAdminControl /></AdminRoute>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col selection:bg-primary-100 selection:text-primary-700">
        <Navbar />
        <main className="flex-grow pt-20 pb-20 md:pb-0">
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </main>
        <BottomNav />
        <Chatbot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
