import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import ProductCard from '../components/product/ProductCard';
import { 
    ShoppingCart, 
    Star, 
    ArrowLeft, 
    Heart, 
    Share2, 
    ShieldCheck, 
    RotateCcw, 
    Truck,
    Info,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [related, setRelated] = useState([]);
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    
    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useCart();

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/api/products/${id}`);
            setProduct(data);
            
            // Recently Viewed Logic
            const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            const filtered = recentlyViewed.filter(p => p._id !== data._id);
            const updated = [data, ...filtered].slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(updated));

            // Fetch related
            try {
                const { data: relatedData } = await api.get(`/api/ai/recommend/${id}`);
                setRelated(relatedData);
            } catch (err) {
                console.log("Failed to fetch related", err);
            }

            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        addToCart({
            product: product._id,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0].url : '',
            price: product.price,
            qty: Number(qty),
            stock: product.stock
        });
        toast.success('Product added to cart');
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            await api.post(
                `/api/products/${id}/reviews`,
                { rating, comment }
            );
            toast.success('Review submitted successfully');
            setRating(0);
            setComment('');
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    if (loading) return <div className="min-h-[70vh] flex items-center justify-center"><Spinner /></div>;
    if (error) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-[2rem] border border-red-100 dark:border-red-800">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Product</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <Link to="/shop" className="btn-primary">Back to Shop</Link>
            </div>
        </div>
    );

    const discountPrice = product.price * 1.2; // Dummy discount simulation

    return (
        <div className="bg-white dark:bg-dark-bg min-h-screen pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 overflow-x-auto whitespace-nowrap">
                    <Link to="/" className="hover:text-primary-600">Home</Link>
                    <span>/</span>
                    <Link to="/shop" className="hover:text-primary-600">Shop</Link>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white truncate">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Product Images */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative group aspect-square rounded-[2.5rem] bg-gray-50 dark:bg-dark-card border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                    src={product.images && product.images.length > 0 ? product.images[activeImage].url : 'https://placehold.co/600x600'} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain p-8 md:p-12"
                                />
                            </AnimatePresence>
                            
                            {/* Actions Overlay */}
                            <div className="absolute top-6 right-6 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl text-gray-900 hover:text-red-500 hover:scale-110 transition-all">
                                    <Heart size={20} />
                                </button>
                                <button className="p-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-xl text-gray-900 hover:text-primary-600 hover:scale-110 transition-all">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`shrink-0 w-24 h-24 rounded-2xl border-2 transition-all p-2 bg-white dark:bg-dark-card ${activeImage === idx ? 'border-primary-600 shadow-lg scale-105' : 'border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} alt={product.name} className="w-full h-full object-contain" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-28">
                            <div className="mb-6">
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">{product.name}</h1>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded-lg text-sm font-bold">
                                        <span>{product.ratings?.toFixed(1) || 0}</span>
                                        <Star size={12} className="ml-1 fill-current" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-400">{product.numOfReviews || 0} Ratings & Reviews</span>
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-dark-card/50 border border-gray-100 dark:border-gray-800 mb-8">
                                <div className="flex items-baseline space-x-3 mb-1">
                                    <span className="text-4xl font-black text-primary-600 leading-none">₹{product.price?.toLocaleString('en-IN')}</span>
                                    <span className="text-xl text-gray-400 line-through">₹{discountPrice?.toLocaleString('en-IN')}</span>
                                    <span className="text-sm font-black text-green-600 uppercase tracking-widest">20% OFF</span>
                                </div>
                                <p className="text-xs text-gray-500 font-bold mb-6">Inclusive of all taxes</p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="p-1.5 rounded-lg bg-primary-100 text-primary-600"><CheckCircle2 size={16} /></div>
                                        <span className="text-gray-600 dark:text-gray-400">Available: **{product.stock} items in stock**</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <div className="p-1.5 rounded-lg bg-green-100 text-green-600"><Truck size={16} /></div>
                                        <span className="text-gray-600 dark:text-gray-400">Free Delivery by **Thursday, Apr 9**</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    {product.stock > 0 ? (
                                        <>
                                            <div className="w-1/3">
                                                <select 
                                                    className="w-full bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-gray-800 rounded-2xl py-4 px-4 font-black transition-all outline-none focus:border-primary-600"
                                                    value={qty}
                                                    onChange={(e) => setQty(e.target.value)}
                                                >
                                                    {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                                                        <option key={x + 1} value={x + 1}>Qty: {x + 1}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button 
                                                onClick={handleAddToCart}
                                                className="flex-1 btn-primary py-4 text-xs tracking-[0.2em] uppercase font-black"
                                            >
                                                Add to Cart
                                            </button>
                                        </>
                                    ) : (
                                        <button disabled className="w-full py-4 bg-gray-200 dark:bg-gray-800 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest">
                                            Currently Out of Stock
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="text-center p-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                    <RotateCcw size={20} className="mx-auto text-primary-600 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-wider">7 Days Return</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                    <ShieldCheck size={20} className="mx-auto text-primary-600 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-wider">GST Invoice</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-gray-800">
                                    <Truck size={20} className="mx-auto text-primary-600 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-wider">Free Shipping</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <h3 className="text-lg font-black dark:text-white mb-4">Description</h3>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                    {product.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <div className="mt-32">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">You May Also Like</h3>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">Smart AI recommendations based on this item.</p>
                            </div>
                            <Link to="/shop" className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                                <ArrowLeft className="rotate-180" size={24} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {related.map(prod => (
                                <ProductCard key={prod._id} product={prod} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews & Ratings Section UI UPGRADE */}
                <div className="mt-32 grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-5">
                       <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Ratings & Reviews</h3>
                       <div className="p-10 rounded-[2.5rem] bg-gray-50 dark:bg-dark-card/50 border border-gray-100 dark:border-gray-800 text-center">
                            <div className="text-7xl font-black text-gray-900 dark:text-white mb-2 leading-none">{product.ratings?.toFixed(1) || 0}</div>
                            <div className="flex justify-center text-yellow-400 mb-4 scale-125">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.round(product.ratings) ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                                ))}
                            </div>
                            <p className="text-sm font-bold text-gray-400 mb-8">{product.numOfReviews || 0} Verified Ratings</p>
                            
                            {user ? (
                                <button 
                                    onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="btn-secondary w-full"
                                >
                                    Write a Review
                                </button>
                            ) : (
                                <Link to="/login" className="btn-secondary w-full">Sign in to Review</Link>
                            )}
                       </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="space-y-8">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review) => (
                                    <div key={review._id} className="pb-8 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-black text-xs uppercase">
                                                {review.name[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white leading-none mb-1">{review.name}</p>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < review.rating ? "fill-current" : "text-gray-200"} />)}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{review.createdAt?.substring(0, 10)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 opacity-50">
                                    <p className="font-bold text-gray-400">No reviews yet for this product.</p>
                                </div>
                            )}
                        </div>

                        {/* Review Form Area */}
                        {user && (
                            <div id="review-form" className="mt-16 p-8 rounded-[2rem] bg-white dark:bg-dark-bg border-2 border-primary-500/10 shadow-2xl">
                                <h4 className="text-xl font-black mb-6">How was your product?</h4>
                                <form onSubmit={submitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Rating</label>
                                        <div className="flex space-x-3">
                                            {[1,2,3,4,5].map(num => (
                                                <button 
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setRating(num)}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${rating >= num ? 'bg-yellow-400 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-gray-200'}`}
                                                >
                                                    <Star fill={rating >= num ? "currentColor" : "none"} size={20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Comment</label>
                                        <textarea 
                                            rows="4"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write your experience with this product..."
                                            className="w-full bg-gray-50 dark:bg-dark-card border-none rounded-2xl p-6 text-sm outline-none focus:ring-4 ring-primary-500/10 transition-all dark:text-white"
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary w-full py-5 text-sm uppercase tracking-widest font-black">Submit Review</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
