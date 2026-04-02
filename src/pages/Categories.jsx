import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import { ShoppingBag, Zap, Smartphone, Package, ChevronRight } from 'lucide-react';
import { CategorySkeleton } from '../components/common/Skeleton';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to load categories', error);
                setLoading(false);
            }
        };
        fetchCategories();
        document.title = 'Categories | Kartiko';
    }, []);

    const getIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes('elect')) return <Smartphone size={32} />;
        if (n.includes('toy') || n.includes('gadget')) return <Zap size={32} />;
        if (n.includes('fashion') || n.includes('wear')) return <ShoppingBag size={32} />;
        return <Package size={32} />;
    };

    const colors = [
        'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 
        'bg-orange-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Browse Categories</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">Explore our curated collections of premium goods.</p>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {[1,2,3,4,5,6,7,8].map(i => <CategorySkeleton key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {categories.map((category, idx) => (
                        <Link 
                            key={category._id} 
                            to={`/shop?category=${category._id}`}
                            className="group"
                        >
                            <motion.div
                                whileHover={{ y: -8 }}
                                className="bg-white dark:bg-dark-card rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden h-full flex flex-col items-center text-center"
                            >
                                <div className={`w-20 h-20 ${colors[idx % colors.length]} text-white rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                                    {getIcon(category.name)}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{category.description || 'Explore our exclusive collection.'}</p>
                                
                                <div className="mt-auto flex items-center text-primary-600 font-bold group-hover:gap-2 transition-all">
                                    <span>View Products</span> <ChevronRight size={18} />
                                </div>

                                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 dark:bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && categories.length === 0 && (
                <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-gray-300 mb-6" />
                    <h2 className="text-2xl font-bold dark:text-white">No categories found.</h2>
                    <p className="text-gray-500 mt-2">Check back later for new arrivals.</p>
                </div>
            )}
        </div>
    );
};

export default Categories;
