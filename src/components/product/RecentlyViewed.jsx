import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { History, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RecentlyViewed = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setProducts(stored);
    }, []);

    if (products.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50/50 dark:bg-dark-card/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <div className="flex items-center space-x-2 text-primary-600 font-black uppercase tracking-widest text-xs mb-3">
                            <History size={14} />
                            <span>Continue Shopping</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Recently Viewed</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Brought to you based on your browsing history.</p>
                    </div>
                    <Link to="/shop" className="group text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center space-x-2 hover:text-primary-600 transition-all">
                        <span>Shop More</span>
                        <div className="p-2 rounded-full bg-white dark:bg-dark-card shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <ArrowRight size={16} />
                        </div>
                    </Link>
                </div>

                <div className="relative overflow-hidden">
                    <div className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                        {products.map((product, idx) => (
                            <motion.div 
                                key={product._id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="w-72 shrink-0 snap-start"
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
