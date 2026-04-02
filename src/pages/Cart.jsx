import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
    Trash2, 
    ShoppingBag, 
    ArrowRight, 
    ArrowLeft, 
    Minus, 
    Plus, 
    ShieldCheck, 
    Truck, 
    Clock,
    ShoppingCart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cartItems, removeFromCart, updateQty } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 pb-32">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-12"
            >
                <div>
                    <h1 className="text-4xl font-black dark:text-white leading-none mb-2">My Shopping Bag<span className="text-primary-600">.</span></h1>
                    <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Total Archive: {cartItems.length} Elite Assets</p>
                </div>
                <button 
                    onClick={() => navigate('/shop')}
                    className="hidden sm:flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-all border border-gray-100 dark:border-gray-800 px-6 py-3 rounded-xl"
                >
                    <ArrowLeft size={14} />
                    <span>Return to Store</span>
                </button>
            </motion.div>

            {cartItems.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-40 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="inline-block p-10 bg-gray-50 dark:bg-dark-bg rounded-[3rem] mb-8 text-gray-300">
                        <ShoppingBag size={64} />
                    </div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Your Bag is Empty</h2>
                    <p className="text-gray-500 font-medium mt-4 max-w-xs mx-auto">Discover our curated collection and start building your premium inventory.</p>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="mt-10 px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 flex items-center mx-auto space-x-3"
                    >
                        <span>Start Discovery</span>
                        <ArrowRight size={16} />
                    </button>
                </motion.div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    {/* Cart Items List */}
                    <div className="lg:w-2/3 space-y-6">
                        <AnimatePresence>
                            {cartItems.map((item, idx) => (
                                <motion.div 
                                    key={item.product}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group bg-white dark:bg-dark-card rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-10">
                                        {/* Image Asset */}
                                        <Link to={`/product/${item.product}`} className="relative shrink-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-32 h-32 object-cover rounded-3xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-110"
                                            />
                                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-black shadow-lg">#{idx + 1}</div>
                                        </Link>

                                        {/* Content Asset */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <Link to={`/product/${item.product}`} className="text-lg font-black text-gray-900 dark:text-white hover:text-primary-600 transition-colors uppercase tracking-tight leading-none mb-2 block">{item.name}</Link>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Original Premium Selection</p>
                                            
                                            <div className="flex items-center justify-center sm:justify-start space-x-6">
                                                <div className="flex items-center bg-gray-50 dark:bg-dark-bg rounded-2xl p-1 px-3 border border-gray-100 dark:border-gray-800">
                                                    <button 
                                                        disabled={item.qty <= 1}
                                                        onClick={() => updateQty(item.product, item.qty - 1)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 transition-all disabled:opacity-30"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-10 text-center text-xs font-black dark:text-white">{item.qty}</span>
                                                    <button 
                                                        disabled={item.qty >= (item.stock || 10)}
                                                        onClick={() => updateQty(item.product, item.qty + 1)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 transition-all disabled:opacity-30"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={() => removeFromCart(item.product)}
                                                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Valuation */}
                                        <div className="text-center sm:text-right">
                                            <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">₹{item.price.toLocaleString('en-IN')} unit</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:w-1/3 w-full sticky top-32">
                        <div className="bg-gray-900 dark:bg-dark-card p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10 opacity-10 blur-2xl bg-primary-600 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/2" />
                            
                            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-10 relative z-10">Cart Architecture</h2>
                            
                            <div className="space-y-6 mb-12 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Inventory base</span>
                                    <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-green-400">
                                    <span className="uppercase tracking-widest">Global Logistics</span>
                                    <span className="font-black">FREE ENTRY</span>
                                </div>
                                <div className="pt-8 border-t border-white/10 flex flex-col items-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-2">Archive Valuation</p>
                                    <p className="text-5xl font-black tracking-tighter leading-none mb-1">₹{subtotal.toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-4">Taxes calculated at final gateway</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate(user ? '/checkout' : '/login?redirect=checkout')}
                                className="w-full bg-white text-gray-900 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
                            >
                                <span>Proceed to Gateway</span>
                                <ArrowRight size={18} />
                            </button>
                            
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-gray-500">
                                    <ShieldCheck size={12} className="text-primary-400" />
                                    <span>Secured</span>
                                </div>
                                <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-widest text-gray-400">
                                    <Truck size={12} className="text-orange-400" />
                                    <span>Express</span>
                                </div>
                            </div>
                        </div>

                        {/* Extra Value Card */}
                        <div className="mt-8 p-8 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center space-x-6 shadow-sm">
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 text-orange-500 rounded-2xl">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-black dark:text-white leading-tight mb-1">Limited Availability</p>
                                <p className="text-[10px] font-medium text-gray-500">Items in bag are not reserved until checkout is confirmed.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
