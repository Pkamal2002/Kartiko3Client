import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, 
    Package, 
    MapPin, 
    CreditCard, 
    CheckCircle2, 
    Clock, 
    Truck, 
    Settings, 
    ShoppingCart,
    Download,
    Calendar,
    MapPinned,
    ShieldCheck,
    Star
} from 'lucide-react';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { generateOrderReceipt } from '../utils/OrderReceipt';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleBuyAgain = () => {
        order.orderItems.forEach(item => {
            addToCart({
                product: item.product,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.qty,
                stock: 100 
            });
        });
        toast.success('Added to cart!');
        navigate('/cart');
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/api/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        if (user) fetchOrder();
    }, [id, user]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg"><Spinner /></div>;
    if (!order) return <div className="text-center mt-40 dark:text-white font-black uppercase tracking-widest">Order not found.</div>;

    const steps = [
        { status: 'Processing', name: 'Packing', icon: <Package size={18} />, active: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) },
        { status: 'Shipped', name: 'Shipped', icon: <Truck size={18} />, active: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus) },
        { status: 'Out for Delivery', name: 'Arriving', icon: <MapPinned size={18} />, active: ['Out for Delivery', 'Delivered'].includes(order.orderStatus) },
        { status: 'Delivered', name: 'Delivered', icon: <CheckCircle2 size={18} />, active: order.orderStatus === 'Delivered', date: order.deliveredAt?.substring(0,10) },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-12 pb-32">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6"
            >
                <div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary-600 transition-all mb-4"
                    >
                        <ArrowLeft size={14} className="mr-2" /> Return to History
                    </button>
                    <h1 className="text-4xl font-black dark:text-white leading-none mb-2">Order Tracking</h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">ID: #{order._id.substring(18).toUpperCase()}</p>
                </div>
                <div className="flex space-x-4">
                    <button 
                        onClick={() => generateOrderReceipt(order)}
                        className="p-4 bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all flex items-center space-x-3 text-sm font-black uppercase tracking-widest"
                    >
                        <Download size={18} className="text-primary-600" />
                        <span>Receipt</span>
                    </button>
                    {order.orderStatus === 'Delivered' && (
                        <button className="btn-primary space-x-2 px-8">
                            <Star size={18} />
                            <span>Rate Items</span>
                        </button>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Side: Progress & Items */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Status Card */}
                    <section className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                                order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-primary-100 text-primary-700'
                            }`}>
                                {order.orderStatus}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 mb-10">
                            <div className="p-2 rounded-xl bg-primary-100 text-primary-600"><Clock size={18} /></div>
                            <h3 className="text-xl font-black">Fulfillment Timeline</h3>
                        </div>

                        {/* Progress Stepper */}
                        <div className="flex justify-between items-center relative py-6 px-4">
                            <div className="absolute top-12 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 z-0"></div>
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center border-[6px] transition-all shadow-xl ${step.active ? 'bg-primary-600 border-primary-50 dark:border-dark-card text-white' : 'bg-gray-100 border-white dark:border-dark-card dark:bg-gray-800 text-gray-300'}`}>
                                        {step.icon}
                                    </div>
                                    <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${step.active ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.name}</p>
                                    {step.date && <p className="text-[9px] font-bold text-gray-400 mt-1">{step.date}</p>}
                                </div>
                            ))}
                        </div>

                        {order.estimatedDeliveryDate && order.orderStatus !== 'Delivered' && (
                            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center space-x-4">
                                <Calendar size={20} className="text-blue-600" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Expected Delivery</p>
                                    <p className="text-sm font-black dark:text-white">
                                        {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Product List */}
                    <section className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Parcel Contents</h3>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="p-8 flex flex-col sm:flex-row items-center group">
                                    <div className="relative">
                                        <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-3xl bg-gray-50 dark:bg-dark-bg border border-gray-100 dark:border-gray-800 transition-transform group-hover:scale-110" />
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-black shadow-lg">x{item.qty}</div>
                                    </div>
                                    <div className="mt-6 sm:mt-0 sm:ml-8 flex-1 text-center sm:text-left">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{item.name}</h4>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Premium Collection Item</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 text-right">
                                        <p className="text-xl font-black text-gray-900 dark:text-white">₹{((item.price || 0) * (item.qty || 0)).toLocaleString('en-IN')}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">₹{(item.price || 0).toLocaleString('en-IN')} unit price</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Side: Logistic Details */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Address Card */}
                    <div className="bg-gray-900 dark:bg-dark-card p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-150 transition-transform duration-700">
                            <MapPin size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Shipping Hub</h3>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary-400 mb-2">Recipient</p>
                                    <p className="text-lg font-black">{order.user?.name || 'Valued Customer'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold leading-relaxed">
                                        {order.shippingAddress.street},<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state},<br />
                                        {order.shippingAddress.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white dark:bg-dark-card p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8">Payment Architecture</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Base Amount</span>
                                <span className="dark:text-white">₹{(order.itemsPrice || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Gst / Tax</span>
                                <span className="dark:text-white">₹{(order.taxPrice || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Logistics</span>
                                <span className="text-green-500">{order.shippingPrice === 0 ? 'COMPLIMENTARY' : `₹${order.shippingPrice}`}</span>
                            </div>
                            <div className="pt-6 border-t border-dashed border-gray-100 dark:border-gray-800 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-600 mb-1">Total Payload</p>
                                    <p className="text-3xl font-black dark:text-white tracking-tighter">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-2xl text-green-600">
                                    <ShieldCheck size={24} />
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 dark:bg-dark-bg rounded-3xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <CreditCard size={18} className="text-gray-400" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Shield</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black dark:text-white capitalize">{order.paymentMethod}</span>
                                <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {order.isPaid ? 'Verification Success' : 'Awaiting Settlement'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Reboot */}
                    <button 
                        onClick={handleBuyAgain}
                        className="w-full btn-primary py-6 rounded-[2rem] shadow-2xl flex items-center justify-center space-x-3"
                    >
                        <ShoppingCart size={20} />
                        <span className="font-black uppercase tracking-widest">Reorder This Cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
