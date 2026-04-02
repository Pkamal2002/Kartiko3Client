import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { ArrowRight, ShoppingBag, Star, Zap, ChevronRight, Package, Smartphone, Laptop, Watch, Heart } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import RecentlyViewed from '../components/product/RecentlyViewed';
import { ProductCardSkeleton, CategorySkeleton } from '../components/common/Skeleton';

const categories = [
    { name: 'Electronics', icon: <Smartphone className="w-6 h-6" />, count: '120+', color: 'bg-blue-500' },
    { name: 'Toys', icon: <Zap className="w-6 h-6" />, count: '80+', color: 'bg-yellow-500' },
    { name: 'Fashion', icon: <ShoppingBag className="w-6 h-6" />, count: '200+', color: 'bg-pink-500' },
    { name: 'Home', icon: <Package className="w-6 h-6" />, count: '150+', color: 'bg-green-500' },
];

const Home = () => {
    const navigate = useNavigate();
    const [latestProducts, setLatestProducts] = useState([]);
    const [homeCategories, setHomeCategories] = useState([]);
    const [ads, setAds] = useState([]);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodData, catData, adsData] = await Promise.all([
                    api.get('/api/products?sortBy=newest'),
                    api.get('/api/categories'),
                    api.get('/api/promotions')
                ]);
                setLatestProducts(prodData.data.products.slice(0, 4));
                setHomeCategories(catData.data.slice(0, 4));
                setAds(adsData.data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Ad Carousel Auto-Play Loop
    useEffect(() => {
        if (ads.length > 1) {
            const timer = setInterval(() => {
                setCurrentAdIndex((prev) => (prev + 1) % ads.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [ads.length]);

    const categoryStyles = [
        { icon: <Smartphone className="w-6 h-6" />, color: 'bg-blue-500' },
        { icon: <Zap className="w-6 h-6" />, color: 'bg-yellow-500' },
        { icon: <ShoppingBag className="w-6 h-6" />, color: 'bg-pink-500' },
        { icon: <Package className="w-6 h-6" />, color: 'bg-green-500' },
    ];

    return (
        <div className="w-full pb-20">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white dark:bg-dark-bg transition-colors duration-500">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50 dark:bg-primary-900/10 skew-x-12 translate-x-20 z-0 hidden lg:block"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12">
                    {ads.length > 0 ? (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={currentAdIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.8 }}
                                className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[70vh] flex items-center group"
                            >
                                <img src={ads[currentAdIndex].imageUrl} alt={ads[currentAdIndex].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent backdrop-blur-[2px]"></div>
                                <div className="relative z-10 p-12 lg:p-24 max-w-3xl">
                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8 drop-shadow-2xl" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                                        {ads[currentAdIndex].title}
                                    </h1>
                                    {ads[currentAdIndex].linkUrl ? (
                                        <a href={ads[currentAdIndex].linkUrl} className="btn-primary px-10 py-5 text-lg inline-flex items-center shadow-2xl hover:scale-105 transition-transform">
                                            Explore Campaign <ArrowRight className="ml-2 w-5 h-5" />
                                        </a>
                                    ) : (
                                        <Link to="/shop" className="btn-primary px-10 py-5 text-lg inline-flex items-center shadow-2xl hover:scale-105 transition-transform">
                                            Shop Collection <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    )}
                                </div>
                                
                                {/* Carousel indicators */}
                                {ads.length > 1 && (
                                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20 bg-black/30 backdrop-blur-md px-6 py-3 rounded-full">
                                        {ads.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setCurrentAdIndex(i)}
                                                className={`h-2 rounded-full transition-all ${i === currentAdIndex ? 'bg-primary-500 w-8' : 'bg-white/50 hover:bg-white w-2'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <span className="inline-block py-1 px-3 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold tracking-widest uppercase mb-4">
                                        New Season Arrivals
                                    </span>
                                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight mb-6">
                                        Style Crafted for your <span className="text-primary-600">Lifestyle.</span>
                                    </h1>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-lg leading-relaxed">
                                        Discover Kartiko's exclusive collection of handpicked premium goods. From cutting-edge electronics to lifestyle basics, we deliver elegance for every moment.
                                    </p>
                                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                        <Link to="/shop" className="btn-primary px-10 py-5 text-lg shadow-2xl flex items-center justify-center">
                                            Explore Collection <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                        <Link to="/shop" className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-gray-800 px-10 py-5 text-lg font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center dark:text-white">
                                            View Promos
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative z-10 bg-gradient-to-br from-primary-200 to-indigo-100 dark:from-dark-card dark:to-dark-bg p-4 rounded-[3rem] shadow-2xl">
                                    <img 
                                        src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop" 
                                        alt="Hero Product" 
                                        className="rounded-[2.5rem] w-full h-[500px] object-cover"
                                    />
                                    <div className="absolute -bottom-10 -left-10 bg-white dark:bg-dark-card p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 hidden xl:block">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-green-100 text-green-600 rounded-2xl"><Star fill="currentColor" size={24} /></div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">4.9/5 Rating</p>
                                                <p className="text-xs text-gray-500">From 10k+ customers</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-20 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-24 bg-gray-50 dark:bg-dark-card/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold dark:text-white mb-2">Shop by Category</h2>
                            <p className="text-gray-500 dark:text-gray-400">Discover your favorite groups of products.</p>
                        </div>
                        <Link to="/shop" className="text-primary-600 font-bold flex items-center hover:underline">
                            View All <ChevronRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {homeCategories.map((cat, idx) => (
                            <motion.div 
                                key={cat._id}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/shop?category=${cat._id}`)}
                                className="group cursor-pointer bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
                            >
                                <div className={`w-16 h-16 ${categoryStyles[idx % 4].color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:rotate-12 transition-transform`}>
                                    {categoryStyles[idx % 4].icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Explore Collection</p>
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                                    <ArrowRight className="text-primary-600" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recently Viewed */}
            <RecentlyViewed />

            {/* Newest Arrivals */}
            <section className="py-24 bg-white dark:bg-dark-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Newest Arrivals</h2>
                        <div className="h-1.5 w-24 bg-primary-600 mx-auto rounded-full"></div>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton /><ProductCardSkeleton />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {latestProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}

                    <div className="mt-16 text-center">
                        <Link to="/shop" className="inline-flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors group">
                            <span>Browse full catalog</span>
                            <div className="p-2 rounded-full border border-gray-200 dark:border-gray-800 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="px-4 py-20 pb-0">
               <div className="max-w-7xl mx-auto bg-primary-600 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-700 rounded-full -ml-32 -mb-32 opacity-50 blur-3xl"></div>
                    
                    <div className="relative z-10 text-center lg:text-left grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">Ready to join the <br /> Kartiko community?</h2>
                            <p className="text-primary-100 text-lg mb-10 opacity-90 max-w-md">Get exclusive access to pre-orders, and early drops in our premium luxury lifestyle ecosystem.</p>
                            <Link to="/register" className="bg-white text-primary-600 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-transform inline-block shadow-xl">
                                Join Now for Free
                            </Link>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative">
                                <motion.div 
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="bg-white/20 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/30 text-white flex flex-col space-y-6"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 rounded-full bg-green-400"></div>
                                        <p className="text-sm font-bold">12,500+ Active Users</p>
                                    </div>
                                    <div className="space-y-3">
                                         <div className="h-2 w-48 bg-white/30 rounded-full"></div>
                                         <div className="h-2 w-32 bg-white/30 rounded-full"></div>
                                    </div>
                                    <div className="flex -space-x-3">
                                        {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-primary-600 bg-gray-200"></div>)}
                                        <div className="w-10 h-10 rounded-full border-2 border-primary-600 bg-white text-primary-600 flex items-center justify-center text-xs font-bold">+1k</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
               </div>
            </section>
        </div>
    );
};

export default Home;
