import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Star, ShoppingCart, Heart, Plus, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user, userWishlist, toggleWishlist } = useAuth();
    const navigate = useNavigate();

    const isWishlisted = userWishlist ? userWishlist.includes(product._id) : false;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            product: product._id,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0].url : '',
            price: product.price,
            qty: 1,
            stock: product.stock
        });
        toast.success(`'${product.name}' added to cart`, {
            icon: '🛒',
            style: {
                borderRadius: '1rem',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            toast.error('Sign in to save favorites');
            navigate('/login');
            return;
        }
        await toggleWishlist(product._id);
    };

    return (
        <motion.div 
            whileHover={{ y: -8 }}
            className="group relative bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full"
        >
            {/* Wishlist Button */}
            <button 
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 z-20 p-3 rounded-2xl bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-xl text-gray-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            >
                <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "group-hover:text-red-500 transition-colors"} />
            </button>

            {/* Image Container */}
            <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-dark-bg p-6">
                <img 
                    src={product.images && product.images.length > 0 ? product.images[0].url : ''} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Stock Badge */}
                {product.stock === 0 ? (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Out of Stock</div>
                ) : (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Original</div>
                )}
                
                {/* Quick Add Overlay */}
                <div className="absolute inset-0 bg-primary-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="p-4 rounded-full bg-white text-primary-600 shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                        <Plus size={32} strokeWidth={3} />
                    </div>
                </div>
            </Link>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{product.category?.name || 'Category'}</p>
                    <Link to={`/product/${product._id}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center space-x-3 mb-6">
                    <div className="flex items-center px-2 py-0.5 rounded-lg bg-green-600 text-white text-[10px] font-black">
                        <span>{product.ratings || 0}</span>
                        <Star size={10} className="ml-1 fill-current" />
                        <Star size={10} className="ml-1 fill-yellow-400 text-yellow-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">({product.numOfReviews || 0} reviews)</span>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">₹{product.price?.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Free Shipping</span>
                    </div>
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="ripple p-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white transition-all shadow-xl active:scale-90 disabled:opacity-30"
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
