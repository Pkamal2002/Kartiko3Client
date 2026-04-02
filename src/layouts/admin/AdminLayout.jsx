import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    Package, 
    Users, 
    ShoppingBag, 
    LogOut, 
    Settings, 
    Ticket,
    ChevronLeft,
    Menu,
    Search,
    Bell,
    User as UserIcon,
    Tag,
    Activity,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const navItems = [
        { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
        { name: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
        { name: 'Coupons', path: '/admin/coupons', icon: <Ticket size={20} /> },
        { name: 'Ads', path: '/admin/ads', icon: <Activity size={20} /> },
        { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    if (user.role === 'super_admin') {
        navItems.push({ name: 'Users', path: '/admin/users', icon: <Users size={20} /> });
        navItems.push({ name: 'Super Control', path: '/admin/control', icon: <Shield size={20} /> });
    }

    const handleLogout = () => {
        logout();
        toast.success('Successfully logged out from Command Center');
        navigate('/');
    };

    const sidebarVariants = {
        expanded: { width: '280px' },
        collapsed: { width: '88px' }
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden">
            {/* Desktop Sidebar */}
            <motion.aside 
                initial="expanded"
                animate={isSidebarCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className="hidden lg:flex flex-col bg-white dark:bg-dark-card border-r border-gray-100 dark:border-gray-800 transition-all duration-300 relative z-30"
            >
                {/* Sidebar Header */}
                <div className="p-8 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                        {!isSidebarCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xl font-black tracking-tighter"
                            >
                                KARTIKO<span className="text-primary-600">.</span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                    <button 
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ChevronLeft className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} size={18} />
                    </button>
                </div>

                {/* Nav Items */}
                <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
                        return (
                            <Link 
                                key={item.name} 
                                to={item.path}
                                title={isSidebarCollapsed ? item.name : ''}
                                className={`relative flex items-center px-4 py-4 rounded-2xl transition-all duration-200 group ${
                                    isActive 
                                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' 
                                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <div className={`${isActive ? 'text-white' : 'group-hover:text-primary-600'}`}>
                                    {item.icon}
                                </div>
                                <AnimatePresence>
                                    {!isSidebarCollapsed && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="ml-4 text-xs font-black uppercase tracking-widest whitespace-nowrap"
                                        >
                                            {item.name}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                {isActive && !isSidebarCollapsed && (
                                    <motion.div layoutId="activeIndicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-50 dark:border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-black uppercase tracking-widest text-[10px]"
                    >
                        <LogOut size={20} />
                        {!isSidebarCollapsed && <span className="ml-4">Sign Out System</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Hub */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Admin Topbar */}
                <header className="h-20 bg-white dark:bg-dark-card border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-8 z-20">
                    <div className="flex items-center flex-1">
                        <button 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-2 mr-4 rounded-xl bg-gray-50 dark:bg-dark-bg"
                        >
                            <Menu size={20} />
                        </button>
                        
                        <div className="hidden md:flex items-center max-w-md w-full relative">
                            <input 
                                type="text" 
                                placeholder="Search inventory or orders..." 
                                className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl py-2.5 pl-12 pr-4 text-xs font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white"
                            />
                            <Search className="absolute left-4 text-gray-400" size={16} />
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:flex flex-col items-end text-right">
                            <span className="text-xs font-black dark:text-white leading-none mb-1">{user.name}</span>
                            <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">{user.role}</span>
                        </div>
                        <div className="relative group">
                            <button className="p-2.5 rounded-2xl bg-gray-50 dark:bg-dark-bg text-gray-500 relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-dark-card" />
                            </button>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 border-2 border-primary-500/20 shadow-lg">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </header>

                {/* Viewport */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 pb-32">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-bg shadow-2xl z-50 lg:hidden p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="text-xl font-black">KARTIKO.</span>
                                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <ChevronLeft size={20} />
                                </button>
                            </div>
                            <div className="flex-1 space-y-2 overflow-y-auto">
                                {navItems.map((item) => (
                                    <Link 
                                        key={item.name} 
                                        to={item.path}
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className={`flex items-center px-6 py-4 rounded-2xl transition-all ${
                                            location.pathname === item.path ? 'bg-primary-600 text-white shadow-xl' : 'text-gray-500'
                                        }`}
                                    >
                                        {item.icon}
                                        <span className="ml-4 text-xs font-black uppercase tracking-widest">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="mt-auto flex items-center px-6 py-4 rounded-2xl text-red-500 bg-red-50 dark:bg-red-900/10 font-black uppercase tracking-widest text-[10px]"
                            >
                                <LogOut size={20} />
                                <span className="ml-4">Exit Terminal</span>
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminLayout;
