import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../utils/api.js';
import toast from 'react-hot-toast';
import { 
    ShoppingCart, 
    Sun, 
    Moon, 
    User as UserIcon, 
    LogOut, 
    Menu, 
    X, 
    Heart, 
    ChevronDown, 
    Search,
    ShoppingBag,
    LayoutDashboard,
    ArrowRight,
    Loader2,
    Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    
    // UI State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [navCategories, setNavCategories] = useState([]);
    
    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0); 

    // Scroll Logic: Hide on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > 50) setIsScrolled(true);
            else setIsScrolled(false);

            if (currentScrollY > lastScrollY && currentScrollY > 100) setIsVisible(false);
            else setIsVisible(true);
            
            setLastScrollY(currentScrollY);
        };

        const fetchCats = async () => {
            try {
                const [catRes, notifRes] = await Promise.all([
                    api.get('/api/categories'),
                    api.get('/api/notifications')
                ]);
                setNavCategories(catRes.data.slice(0, 3));
                setNotifications(notifRes.data);
            } catch (error) {
                console.error("Failed to load nav categories");
            }
        };

        fetchCats();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Search Autocomplete Logic (Debounced)
    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearchLoading(true);
            try {
                const { data } = await api.get(`/api/products?keyword=${searchQuery}`);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearchLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 400);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Categories', path: '/categories', hasMegaMenu: true },
    ];

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?keyword=${searchQuery}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <motion.nav 
            initial={{ y: 0 }}
            animate={{ y: isVisible ? 0 : -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn(
                "fixed w-full z-50 top-0 start-0 transition-all duration-300",
                isScrolled 
                    ? "bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm py-2" 
                    : "bg-transparent py-4"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center group shrink-0">
                        <span className="text-2xl font-black tracking-tighter dark:text-white transition-transform group-hover:scale-105">
                            KARTIKO<span className="text-primary-600">.</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-1 mx-4">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group">
                                <Link 
                                    to={link.path}
                                    onMouseEnter={() => link.hasMegaMenu && setIsMegaMenuOpen(true)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center space-x-1",
                                        location.pathname === link.path 
                                            ? "text-primary-600 bg-primary-50 dark:bg-primary-900/10" 
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <span>{link.name}</span>
                                    {link.hasMegaMenu && <ChevronDown size={14} className={cn("transition-transform", isMegaMenuOpen && "rotate-180")} />}
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Advanced Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-6 relative" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="w-full relative group">
                            <input 
                                type="text"
                                placeholder="Search premium products..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchOpen(true);
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                                className="w-full bg-gray-100 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-800 border-2 focus:border-primary-500/50 rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium transition-all outline-none"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                {isSearchLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            </div>
                        </form>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {isSearchOpen && (searchQuery.length > 1) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden z-50 p-2"
                                >
                                    {searchResults.length > 0 ? (
                                        <div className="flex flex-col">
                                            {searchResults.map((product) => (
                                                <Link 
                                                    key={product._id} 
                                                    to={`/product/${product._id}`}
                                                    onClick={() => setIsSearchOpen(false)}
                                                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                                                >
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="ml-4 flex-1">
                                                        <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                                                        <p className="text-xs text-primary-600 font-black">${product.price}</p>
                                                    </div>
                                                    <ChevronDown className="-rotate-90 text-gray-300 group-hover:text-primary-600 transition-colors" size={16} />
                                                </Link>
                                            ))}
                                            <button 
                                                onClick={handleSearchSubmit}
                                                className="w-full p-4 text-center text-xs font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 transition-colors border-t border-gray-50 dark:border-gray-800"
                                            >
                                                View all results for "{searchQuery}"
                                            </button>
                                        </div>
                                    ) : !isSearchLoading ? (
                                        <div className="p-10 text-center">
                                            <p className="text-sm text-gray-500">No products found for "{searchQuery}"</p>
                                        </div>
                                    ) : null}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 lg:space-x-2 shrink-0">
                        {/* Theme Toggle */}
                        <button onClick={toggleTheme} className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                            >
                                <Bell size={20} />
                                <AnimatePresence>
                                    {notifications.length > 0 && (
                                        <motion.span 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-gray-50 dark:ring-dark-bg"
                                        />
                                    )}
                                </AnimatePresence>
                            </button>
                            <AnimatePresence>
                                {isNotifOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden z-50 p-2"
                                    >
                                        <div className="p-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Notifications</p>
                                        </div>
                                <div className="max-h-[400px] overflow-y-auto px-2 pb-2 custom-scrollbar">
                                            {notifications.length > 0 ? notifications.map((n, i) => (
                                                <a 
                                                    key={n._id} 
                                                    href={n.linkUrl || '#'}
                                                    target={n.linkUrl ? "_blank" : "_self"}
                                                    className={`flex flex-col p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all mb-2 cursor-pointer border ${n.type === 'alert' ? 'border-red-100 dark:border-red-900/30' : 'border-transparent'}`}
                                                    style={{ animationDelay: `${i * 50}ms` }}
                                                >
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded w-fit mb-2 ${n.type === 'alert' ? 'bg-red-100 text-red-600' : n.type === 'promo' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {n.type}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{n.title}</span>
                                                    <span className="text-xs text-gray-500 mt-1">{n.message}</span>
                                                </a>
                                            )) : (
                                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                                        <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                    <div className="text-sm font-black text-gray-900 dark:text-gray-300">Quiet Sector</div>
                                                    <div className="text-xs text-gray-500 mt-1">No alerts or messages right now.</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ShoppingCart size={20} />
                            <AnimatePresence>
                                {cartItemsCount > 0 && (
                                    <motion.span 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-black text-white ring-4 ring-white dark:ring-dark-bg"
                                    >
                                        {cartItemsCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>

                        {/* User / Login */}
                        {user ? (
                            <div className="hidden lg:flex items-center ml-2 border-l border-gray-200 dark:border-gray-800 pl-4 relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-3 group"
                                >
                                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 group-hover:ring-4 ring-primary-500/10 transition-all">
                                        <UserIcon size={18} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-none mb-0.5">{user.name.split(' ')[0]}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none">Account</span>
                                    </div>
                                    <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isProfileOpen && "rotate-180")} />
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-[2rem] shadow-2xl overflow-hidden z-50 p-2"
                                        >
                                            <div className="p-4 border-b border-gray-50 dark:border-gray-800 mb-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                                            </div>
                                            <Link 
                                                to="/profile" 
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                                            >
                                                <UserIcon size={18} className="text-gray-400 group-hover:text-primary-600" />
                                                <span className="text-sm font-bold">My Profile</span>
                                            </Link>
                                            <Link 
                                                to="/profile?tab=orders" 
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                                            >
                                                <ShoppingBag size={18} className="text-gray-400 group-hover:text-primary-600" />
                                                <span className="text-sm font-bold">Orders</span>
                                            </Link>
                                            <Link 
                                                to="/wishlist" 
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                                            >
                                                <Heart size={18} className="text-gray-400 group-hover:text-primary-600" />
                                                <span className="text-sm font-bold">Wishlist</span>
                                            </Link>
                                            {(user.role === 'admin' || user.role === 'super_admin') && (
                                                <Link 
                                                    to="/admin" 
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
                                                >
                                                    <LayoutDashboard size={18} className="text-gray-400 group-hover:text-primary-600" />
                                                    <span className="text-sm font-bold">Dashboard</span>
                                                </Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setIsProfileOpen(false);
                                                    toast.success('Successfully signed out');
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all group text-red-600"
                                            >
                                                <LogOut size={18} />
                                                <span className="text-sm font-black uppercase tracking-widest text-[10px]">Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link to="/login" className="hidden lg:flex btn-primary py-2.5 px-6 shadow-none text-xs tracking-widest uppercase font-black ml-2">
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="lg:hidden p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mega Menu Overlay */}
            <AnimatePresence>
                {isMegaMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onMouseLeave={() => setIsMegaMenuOpen(false)}
                        className="absolute top-full left-0 w-full bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-gray-800 shadow-2xl z-40 py-12 px-4 sm:px-6 lg:px-8"
                    >
                        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-12">
                            <div className="col-span-1 border-r border-gray-100 dark:border-gray-800 pr-12">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 mb-6">Explore Kartiko</h3>
                                <div className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                                    <p>Discover our curated collections of premium lifestyle goods, handpicked for quality and elegance.</p>
                                    <Link to="/shop" className="inline-flex items-center space-x-2 text-primary-600 font-bold hover:underline">
                                        <span>Full Catalog</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                            <div className="col-span-3 grid grid-cols-3 gap-8">
                                {navCategories.length > 0 ? navCategories.map((cat, idx) => {
                                    const iconColors = ['bg-blue-50 text-blue-600', 'bg-pink-50 text-pink-600', 'bg-green-50 text-green-600'];
                                    return (
                                        <Link key={cat._id} to={`/shop?category=${cat._id}`} className="group p-6 rounded-3xl bg-gray-50 dark:bg-dark-card/50 hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 shadow-sm hover:shadow-xl">
                                            <div className={cn("p-4 w-fit rounded-2xl mb-4 group-hover:scale-110 transition-transform", iconColors[idx % 3])}>
                                                <ShoppingBag size={24} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2">{cat.name}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description || 'Curated premium collection.'}</p>
                                        </Link>
                                    );
                                }) : (
                                    <div className="col-span-3 py-10 text-center">
                                       <p className="text-gray-500 dark:text-gray-400 font-medium">Discovering collections...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Nav Overlay (Updated to full screen slide) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[60] lg:hidden bg-white dark:bg-dark-bg"
                    >
                        <div className="flex flex-col h-full">
                            <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                                <span className="text-xl font-black">KARTIKO.</span>
                                <button onClick={() => setIsMenuOpen(false)} className="p-3 rounded-full bg-gray-50 dark:bg-gray-800">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 px-12 font-bold text-lg outline-none border-2 border-transparent focus:border-primary-500"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                </form>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Navigation</h3>
                                    <ul className="space-y-6">
                                        {navLinks.map(link => (
                                            <li key={link.name}>
                                                <Link 
                                                    onClick={() => setIsMenuOpen(false)}
                                                    to={link.path} 
                                                    className="text-3xl font-black block hover:text-primary-600 transition-colors"
                                                >
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {user ? (
                                    <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Account Control</h3>
                                        <div className="flex flex-col space-y-4">
                                            <Link onClick={() => setIsMenuOpen(false)} to="/profile" className="text-2xl font-black">Profile</Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/profile?tab=orders" className="text-2xl font-black">Orders</Link>
                                            <Link onClick={() => setIsMenuOpen(false)} to="/wishlist" className="text-2xl font-black">Wishlist</Link>
                                            {(user.role === 'admin' || user.role === 'super_admin') && (
                                                <Link onClick={() => setIsMenuOpen(false)} to="/admin" className="text-2xl font-black text-primary-600">Admin Panel</Link>
                                            )}
                                            <button 
                                                onClick={() => {
                                                    logout();
                                                    setIsMenuOpen(false);
                                                    toast.success('Successfully signed out');
                                                    navigate('/');
                                                }}
                                                className="w-full flex items-center justify-center space-x-3 py-5 bg-red-50 text-red-600 font-black uppercase tracking-widest text-xs rounded-2xl"
                                            >
                                                <LogOut size={20} />
                                                <span>Sign Out System</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <Link 
                                            to="/login" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full flex items-center justify-center py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary-500/20"
                                        >
                                            Access Identity
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

// Simple Smartphone icon placeholder since lucide auto-import might fail on some setups
const Smartphone = ({ size }) => <LayoutDashboard size={size} />;

export default Navbar;
