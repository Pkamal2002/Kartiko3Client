import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
    Trash2, 
    Edit, 
    Plus, 
    Package, 
    Search, 
    Filter, 
    ChevronRight, 
    MoreVertical,
    ArrowUpDown,
    Eye,
    Tag,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton } from '../../components/common/Skeleton';

const AdminProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                api.get('/api/products'),
                api.get('/api/categories')
            ]);
            setProducts(prodRes.data.products);
            setCategories(catRes.data);
            setLoading(false);
        } catch (error) {
            toast.error('Data orchestration failed');
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Command Center | Inventory | Kartiko';
        fetchInitialData();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('IRREVERSIBLE ACTION: Permanently remove this asset from inventory?')) {
            try {
                await api.delete(`/api/products/${id}`);
                toast.success('Asset purged successfully');
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                toast.error('System failure during deletion');
            }
        }
    };

    // Filter Logic
    const filteredProducts = products
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                p._id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'stock-low') return a.stock - b.stock;
            if (sortBy === 'stock-high') return b.stock - a.stock;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    if (loading) return <TableSkeleton rows={8} />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10 pb-20"
        >
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center">
                        <Package className="mr-4 text-primary-600" /> Inventory Assets
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Full life-cycle product management hub</p>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`p-4 rounded-2xl border transition-all flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest ${isFilterOpen ? 'bg-primary-50 border-primary-100 text-primary-600' : 'bg-white dark:bg-dark-card border-gray-100 dark:border-gray-800 text-gray-500 hover:border-gray-200'}`}
                    >
                        <Filter size={16} />
                        <span>Refine View</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/products/create')}
                        className="btn-primary py-4 px-8 rounded-2xl flex items-center space-x-3 shadow-2xl shadow-primary-500/20"
                    >
                        <Plus size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Register Asset</span>
                    </button>
                </div>
            </div>

            {/* Modern Control Bar */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white dark:bg-dark-card p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Universal Search</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, ID or tags..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-dark-bg border-none p-4 pl-12 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Asset Category</label>
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-dark-bg border-none p-4 rounded-2xl text-xs font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white appearance-none"
                                >
                                    <option value="All">All Classifications</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sort Logic</label>
                                <div className="flex bg-gray-50 dark:bg-dark-bg p-1.5 rounded-2xl">
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-transparent border-none p-2.5 text-xs font-bold outline-none dark:text-white appearance-none"
                                    >
                                        <option value="newest">System Onboarding</option>
                                        <option value="price-low">Price: Economic First</option>
                                        <option value="price-high">Price: Premium First</option>
                                        <option value="stock-low">Stock: Scarcity First</option>
                                        <option value="stock-high">Stock: Abundance First</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assets Table */}
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Detail</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Classification</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ops</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <AlertCircle size={48} className="text-gray-300 mb-6" />
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Zero Ambiguity Detected</h3>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No assets matching your parameters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-16 w-16 rounded-2xl bg-gray-50 dark:bg-dark-bg overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                                                    {product.images?.length > 0 ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="text-gray-300" size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 dark:text-white leading-none mb-1.5">{product.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">UID: {product._id.substring(18).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                <Tag size={12} className="text-primary-600" />
                                                <span>{product.category}</span>
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-gray-900 dark:text-white mb-1">₹{product.price.toLocaleString('en-IN')}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Unit Price Val</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                {product.stock > 10 ? (
                                                    <span className="inline-flex items-center space-x-1.5 text-green-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{product.stock} Optimised</span>
                                                    </span>
                                                ) : product.stock > 0 ? (
                                                    <span className="inline-flex items-center space-x-1.5 text-orange-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{product.stock} Low Stock</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center space-x-1.5 text-red-600">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">System Depleted</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                                    className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-blue-600 transition-all border border-gray-100 dark:border-gray-800"
                                                    title="Modify Matrix"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteHandler(product._id)}
                                                    className="p-3 rounded-2xl bg-red-50 text-red-400 hover:text-red-700 transition-all border border-red-100"
                                                    title="Purge Identity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <MoreVertical size={18} className="text-gray-300 ml-auto group-hover:hidden" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminProducts;
