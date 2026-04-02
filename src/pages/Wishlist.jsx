import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import { Heart, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchWishlist = async () => {
            try {
                const { data } = await api.get('/api/users/wishlist');
                setWishlist(data);
                setLoading(false);
            } catch (err) {
                toast.error('Failed to load wishlist');
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [user, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 pb-32">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-8"
            >
                <div>
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-3 rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                            <Heart size={24} className="fill-current" />
                        </div>
                        <h1 className="text-4xl font-black dark:text-white leading-none">Curated Favorites<span className="text-primary-600">.</span></h1>
                    </div>
                    <p className="text-gray-500 font-medium max-w-md">Your personal archive of elite assets and premium selections. Ready for acquisition at your request.</p>
                </div>
                
                <button 
                    onClick={() => navigate('/shop')}
                    className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-all border border-gray-100 dark:border-gray-800 px-8 py-3 rounded-xl"
                >
                    <ArrowLeft size={14} />
                    <span>Return to Store</span>
                </button>
            </motion.div>

            {wishlist.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-40 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                    <div className="inline-block p-10 bg-gray-50 dark:bg-dark-bg rounded-[3rem] mb-8 text-gray-300">
                        <Heart size={64} />
                    </div>
                    <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Archive is Empty</h2>
                    <p className="text-gray-500 font-medium mt-4 max-w-xs mx-auto">Discover something extraordinary in our premium collection and save it here.</p>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="mt-10 px-10 py-5 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30 flex items-center mx-auto space-x-3"
                    >
                        <span>Explore Premium Collection</span>
                        <ArrowRight size={16} />
                    </button>
                </motion.div>
            ) : (
                <div className="space-y-12">
                    <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">
                        <Sparkles size={14} />
                        <span>{wishlist.length} Elite Tier Selection{wishlist.length > 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                        <AnimatePresence>
                            {wishlist.map((product, idx) => (
                                <motion.div 
                                    key={product._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
