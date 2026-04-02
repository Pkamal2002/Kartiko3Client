import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();
    const { cartItems } = useCart();
    const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    const navItems = [
        { name: 'Home', path: '/', icon: <Home size={22} /> },
        { name: 'Shop', path: '/shop', icon: <ShoppingBag size={22} /> },
        { name: 'Cart', path: '/cart', icon: <ShoppingCart size={22} />, badge: cartItemsCount },
        { name: 'Wishlist', path: '/wishlist', icon: <Heart size={22} /> },
        { name: 'Account', path: user ? '/profile' : '/login', icon: <User size={22} /> },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-4">
            <nav className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl flex items-center justify-around p-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    
                    return (
                        <Link 
                            key={item.name} 
                            to={item.path} 
                            className="relative flex flex-col items-center justify-center w-16 h-14 transition-all"
                        >
                            <div className={cn(
                                "p-2 rounded-2xl transition-all duration-300",
                                isActive 
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/40 -translate-y-1" 
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            )}>
                                {item.icon}
                                {item.badge > 0 && !isActive && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white ring-2 ring-white dark:ring-dark-card">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold mt-1 transition-all",
                                isActive ? "opacity-100 text-primary-600" : "opacity-0"
                            )}>
                                {item.name}
                            </span>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="bottom-nav-indicator"
                                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-600"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNav;
