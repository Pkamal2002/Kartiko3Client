import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api.js';
import ProductCard from '../components/product/ProductCard';
import Spinner from '../components/common/Spinner';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { 
    Filter, 
    X, 
    ChevronDown, 
    Search, 
    SlidersHorizontal, 
    LayoutGrid, 
    ArrowUpDown,
    RotateCcw,
    Zap,
    Tag,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filters and Pagination
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Mobile sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const catParam = searchParams.get('category') || 'all';
        const keyParam = searchParams.get('keyword') || '';
        setCategory(catParam);
        setKeyword(keyParam);
    }, [searchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories.");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/api/products?pageNumber=${page}`;
                if (keyword) url += `&keyword=${keyword}`;
                if (category && category !== 'all') url += `&category=${category}`;
                if (minPrice) url += `&minPrice=${minPrice}`;
                if (maxPrice) url += `&maxPrice=${maxPrice}`;
                if (sortBy) url += `&sortBy=${sortBy}`;

                const { data } = await api.get(url);
                setProducts(data.products);
                setPages(data.pages);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchProducts();
        }, 400);

        return () => clearTimeout(debounce);
    }, [page, keyword, category, minPrice, maxPrice, sortBy]);

    const handleReset = () => {
        setKeyword('');
        setCategory('all');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('newest');
        setPage(1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            {/* Page Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
            >
                <div>
                    <h1 className="text-5xl font-black dark:text-white leading-tight">Collection Hub<span className="text-primary-600">.</span></h1>
                    <p className="text-gray-500 font-medium mt-2 max-w-lg">Discover our curated selection of premium assets and high-performance products tailored for your lifestyle.</p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <select 
                            className="appearance-none bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl px-8 py-4 pr-12 text-xs font-black uppercase tracking-widest outline-none shadow-sm hover:shadow-xl transition-all dark:text-white cursor-pointer"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                        >
                            <option value="newest">Latest Arrivals</option>
                            <option value="price_asc">Price Ascending</option>
                            <option value="price_desc">Price Descending</option>
                            <option value="rating_desc">Top Rated</option>
                        </select>
                        <ArrowUpDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-4 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/20"
                    >
                        <SlidersHorizontal size={20} />
                    </button>
                </div>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-12 items-start">
                
                {/* Sidebar Filter System */}
                <AnimatePresence>
                    {(isSidebarOpen || window.innerWidth >= 768) && (
                        <motion.div 
                            initial={window.innerWidth < 768 ? { x: -300 } : { opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ x: -300, opacity: 0 }}
                            className={`fixed inset-0 md:relative md:inset-auto z-50 md:z-auto bg-white dark:bg-dark-bg md:bg-transparent ${isSidebarOpen ? 'block' : 'hidden md:block'} w-full max-w-[280px] flex-shrink-0`}
                        >
                            <div className="h-full md:h-auto overflow-y-auto p-8 md:p-0 space-y-10">
                                <div className="flex justify-between items-center md:hidden mb-10">
                                    <h2 className="text-2xl font-black">Filters</h2>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800"><X /></button>
                                </div>

                                {/* Discovery Search */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Discovery Search</h3>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl p-4 pl-12 text-xs font-bold outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                            placeholder="Find assets..."
                                            value={keyword}
                                            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                                        />
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>

                                {/* Catalog Segments */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-6">
                                        <LayoutGrid size={14} className="text-primary-600" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Segments</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <button 
                                            onClick={() => { setCategory('all'); setPage(1); }}
                                            className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${category === 'all' ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card'}`}
                                        >
                                            Master Catalog
                                        </button>
                                        {categories.map((cat) => (
                                            <button 
                                                key={cat._id}
                                                onClick={() => { setCategory(cat._id); setPage(1); }}
                                                className={`w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat._id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pricing Thresholds */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-6">
                                        <Tag size={14} className="text-orange-500" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Valuation</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            type="number" 
                                            className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-[10px] font-black outline-none dark:text-white"
                                            placeholder="MIN"
                                            value={minPrice}
                                            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                                        />
                                        <input 
                                            type="number" 
                                            className="w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-[10px] font-black outline-none dark:text-white"
                                            placeholder="MAX"
                                            value={maxPrice}
                                            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleReset}
                                    className="w-full flex items-center justify-center space-x-3 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform"
                                >
                                    <RotateCcw size={16} />
                                    <span>Reset Engine</span>
                                </button>
                                
                                <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 dark:border-primary-800">
                                    <div className="flex items-center space-x-2 text-primary-600 mb-2">
                                        <Zap size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mastery Tip</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed font-bold italic">Refine your search parameters to discover elite tiered assets.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Listing Architecture */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                            {[...Array(6)].map((_, i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-8 rounded-[2rem] border border-red-100 dark:border-red-800 font-bold">{error}</div>
                    ) : products.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-40 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm"
                        >
                            <div className="inline-block p-10 bg-gray-50 dark:bg-dark-bg rounded-[3rem] mb-8 text-gray-300">
                                <Search size={64} />
                            </div>
                            <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Null Match Instance</h3>
                            <p className="text-gray-500 font-medium mt-4 max-w-xs mx-auto">Our systems couldn't locate assets matching your current parameters.</p>
                            <button onClick={handleReset} className="mt-10 px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/30">Force Reset Discovery</button>
                        </motion.div>
                    ) : (
                        <div className="space-y-16">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                {products.map((product, idx) => (
                                    <motion.div 
                                        key={product._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Architecture */}
                            {pages > 1 && (
                                <div className="flex justify-center items-center space-x-4">
                                    {[...Array(pages).keys()].map(x => (
                                        <button
                                            key={x + 1}
                                            onClick={() => { setPage(x + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                                                x + 1 === page
                                                    ? 'bg-primary-600 text-white shadow-2xl scale-110'
                                                    : 'bg-white dark:bg-dark-card text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                                            }`}
                                        >
                                            {x + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
