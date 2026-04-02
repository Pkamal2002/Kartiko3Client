import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
    Tag, 
    Ticket, 
    CheckCircle, 
    XCircle, 
    MapPin, 
    Plus, 
    ChevronRight, 
    Truck, 
    Package, 
    CreditCard, 
    User as UserIcon,
    ArrowLeft,
    CheckCircle2,
    Clock,
    X,
    ChevronDown,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(1); // 1: Login, 2: Address, 3: Order Summary
    const [address, setAddress] = useState({
        street: '', city: '', state: '', zipCode: '', country: 'India', phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({ gstRate: 18, shippingThreshold: 500, shippingFee: 50 });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [saveNewAddress, setSaveNewAddress] = useState(false);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else if (cartItems.length === 0) {
            navigate('/cart');
        } else {
            setActiveStep(2); // Auto-skip login step if user is here
        }

        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/api/settings');
                setSettings(data);
            } catch (error) {
                console.error('Failed to load settings');
            }
        };

        const fetchAddresses = async () => {
            try {
                const { data } = await api.get('/api/auth/profile');
                const fetchedAddresses = data.addresses || [];
                setSavedAddresses(fetchedAddresses);
                const defaultAddr = fetchedAddresses.find(a => a.isDefault);
                if (defaultAddr) {
                    setAddress({
                        street: defaultAddr.street,
                        city: defaultAddr.city,
                        state: defaultAddr.state || '',
                        zipCode: defaultAddr.zipCode,
                        country: defaultAddr.country,
                        phone: defaultAddr.phone
                    });
                    setSelectedAddressId(defaultAddr._id);
                }
            } catch (error) {
                console.error('Failed to load saved addresses');
            }
        };

        fetchSettings();
        if (user) fetchAddresses();
    }, [user, navigate, cartItems]);

    const handleAddressChange = (e) => {
        setAddress({ ...address, [e.target.name]: e.target.value });
    };

    const handleSelectSavedAddress = (addr) => {
        setAddress({
            street: addr.street,
            city: addr.city,
            state: addr.state || '',
            zipCode: addr.zipCode,
            country: addr.country,
            phone: addr.phone
        });
        setSelectedAddressId(addr._id);
        setIsAddingNewAddress(false);
    };

    const confirmAddress = () => {
        if (!address.street || !address.city || !address.zipCode || !address.phone) {
            toast.error('Complete your address detail');
            return;
        }
        setActiveStep(3); // Go to Summary
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        try {
            const { data } = await api.post('/api/coupons/validate', {
                code: couponCode,
                orderValue: itemsPrice
            });
            setAppliedCoupon(data);
            
            let discount = 0;
            if (data.discountType === 'percentage') {
                discount = (itemsPrice * data.discountAmount) / 100;
            } else {
                discount = data.discountAmount;
            }
            setDiscountAmount(discount);
            toast.success(`Coupon "${data.code}" applied!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon');
            setAppliedCoupon(null);
            setDiscountAmount(0);
        }
    };

    // Calculation Constants
    const itemsPrice = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0), [cartItems]);
    const shippingPrice = useMemo(() => itemsPrice >= settings.shippingThreshold ? 0 : settings.shippingFee, [itemsPrice, settings]);
    const taxPrice = useMemo(() => Number(((settings.gstRate / 100) * (itemsPrice - discountAmount)).toFixed(2)), [itemsPrice, discountAmount, settings]);
    const totalPrice = useMemo(() => (itemsPrice + shippingPrice + taxPrice - discountAmount).toFixed(2), [itemsPrice, shippingPrice, taxPrice, discountAmount]);

    const displayRazorpay = async () => {
        setLoading(true);
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
            toast.error('Razorpay SDK failed to load');
            setLoading(false);
            return;
        }

        try {
            const orderData = {
                orderItems: cartItems,
                shippingAddress: address,
                paymentMethod: 'Razorpay',
                itemsPrice,
                shippingPrice,
                taxPrice,
                discountPrice: discountAmount,
                totalPrice,
            };

            let razorpayKey = 'rzp_test_SYMeUhSPRoocAF'; // Fallback
            try {
                const { data: config } = await api.get('/api/orders/config/razorpay');
                if (config.key) razorpayKey = config.key;
            } catch (err) {}

            const { data: razorpayOrder } = await api.post('/api/orders/razorpay', {
                amount: totalPrice
            });

            const options = {
                key: razorpayKey, 
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'KARTIKO.',
                description: 'Order Payment',
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const { data: createdOrder } = await api.post('/api/orders', orderData);

                        await api.post('/api/orders/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: createdOrder._id
                        });

                        if (saveNewAddress && !selectedAddressId) {
                            try {
                                await api.post('/api/users/addresses', address);
                            } catch (err) {}
                        }

                        clearCart();
                        toast.success('ORDER PLACED!', { icon: '🏆', duration: 6000 });
                        navigate(`/order/${createdOrder._id}`);
                    } catch (error) {
                        toast.error(error.response?.data?.message || 'Verification Failed');
                    }
                },
                prefill: { name: user.name, email: user.email, contact: address.phone },
                theme: { color: '#4f46e5' }
            };
            
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            toast.error(error.response?.data?.message || 'Order failed');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Vertical Wizard (Left) */}
                <div className="lg:w-2/3 space-y-6">
                    
                    {/* STEP 1: USER ASSET (Log-in) */}
                    <div className={`bg-white dark:bg-dark-card rounded-3xl border ${activeStep === 1 ? 'border-primary-500 shadow-2xl scale-[1.02]' : 'border-gray-100 dark:border-gray-800 opacity-80'} transition-all overflow-hidden`}>
                        <div className="p-6 bg-primary-600 flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <span className="w-8 h-8 rounded-full bg-white text-primary-600 flex items-center justify-center font-black">1</span>
                                <h3 className="text-white font-black text-xs uppercase tracking-widest">Login Identity</h3>
                            </div>
                            {activeStep > 1 && <CheckCircle2 className="text-white" size={20} />}
                        </div>
                        {activeStep === 1 ? (
                            <div className="p-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center"><UserIcon /></div>
                                    <div>
                                        <p className="font-black text-lg">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveStep(2)} className="btn-primary mt-8 py-3 px-10">CONTINUE</button>
                            </div>
                        ) : (
                            <div className="p-6 px-10 flex items-center space-x-4">
                                <p className="text-sm font-bold">{user.name} <span className="text-gray-400 mx-2">|</span> {user.email}</p>
                                <button onClick={() => setActiveStep(1)} className="text-[10px] font-black tracking-widest text-primary-600 border border-primary-600 rounded-lg px-3 py-1 uppercase">Change</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 2: DELIVERY LOGISTICS */}
                    <div className={`bg-white dark:bg-dark-card rounded-3xl border ${activeStep === 2 ? 'border-primary-500 shadow-2xl' : 'border-gray-100 dark:border-gray-800'} transition-all overflow-hidden`}>
                        <div className={`p-6 ${activeStep === 2 ? 'bg-primary-600' : 'bg-gray-50 dark:bg-dark-bg'} flex justify-between items-center transition-all`}>
                            <div className="flex items-center space-x-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${activeStep === 2 ? 'bg-white text-primary-600' : 'bg-gray-200 text-gray-500'}`}>2</span>
                                <h3 className={`font-black text-xs uppercase tracking-widest ${activeStep === 2 ? 'text-white' : 'text-gray-400'}`}>Delivery Logistics</h3>
                            </div>
                            {activeStep > 2 && <CheckCircle2 className="text-primary-600" size={20} />}
                        </div>
                        
                        <AnimatePresence>
                            {activeStep === 2 && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="p-8"
                                >
                                    {savedAddresses.length > 0 && !isAddingNewAddress ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {savedAddresses.map(addr => (
                                                    <div 
                                                        key={addr._id}
                                                        onClick={() => handleSelectSavedAddress(addr)}
                                                        className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedAddressId === addr._id ? 'border-primary-500 bg-primary-50/10' : 'border-gray-100 dark:border-gray-800'}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800"><MapPin size={18} className="text-primary-600" /></div>
                                                            {selectedAddressId === addr._id && <CheckCircle2 className="text-primary-600" />}
                                                        </div>
                                                        <p className="font-black text-sm mb-1">{addr.street}</p>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{addr.city}, {addr.zipCode}</p>
                                                        <p className="text-xs font-bold mt-2">📞 {addr.phone}</p>
                                                        {selectedAddressId === addr._id && (
                                                            <button onClick={(confirmAddress)} className="mt-6 w-full py-4 bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-500/30">DELIVER HERE</button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button 
                                                    onClick={() => { setIsAddingNewAddress(true); setSelectedAddressId(null); setAddress({ street: '', city: '', state: '', zipCode: '', country: 'India', phone: '' }); }}
                                                    className="p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-500 transition-all"
                                                >
                                                    <Plus size={32} className="mb-2" />
                                                    <span className="font-black text-xs uppercase tracking-widest">Add New Address</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            <div className="flex items-center space-x-2 text-primary-600 font-black uppercase tracking-widest text-[10px] mb-4">
                                                <MapPin size={14} /> <span>New Fulfillment Address</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="md:col-span-2">
                                                    <input name="street" value={address.street} onChange={handleAddressChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white" placeholder="Street Address" />
                                                </div>
                                                <input name="city" value={address.city} onChange={handleAddressChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white" placeholder="City" />
                                                <input name="zipCode" value={address.zipCode} onChange={handleAddressChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white" placeholder="Pincode" />
                                                <input name="phone" value={address.phone} onChange={handleAddressChange} className="w-full bg-gray-50 dark:bg-dark-bg border-none rounded-2xl p-5 text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 dark:text-white" placeholder="Active Phone Number" />
                                                <div className="flex items-center pt-4">
                                                    <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} className="w-5 h-5 rounded-lg text-primary-600 border-none bg-gray-100 outline-none" />
                                                    <label className="ml-3 text-xs font-black uppercase tracking-widest text-gray-400">Save for future purchases</label>
                                                </div>
                                            </div>
                                            <div className="flex space-x-4">
                                                <button onClick={confirmAddress} className="btn-primary flex-1 py-4">CONFIRM & CONTINUE</button>
                                                {savedAddresses.length > 0 && <button onClick={() => setIsAddingNewAddress(false)} className="px-8 font-black uppercase tracking-widest text-[10px] text-gray-400">Cancel</button>}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        {activeStep > 2 && (
                            <div className="p-6 px-10 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{address.street}, {address.city}</p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Pincode: {address.zipCode}</p>
                                </div>
                                <button onClick={() => setActiveStep(2)} className="text-[10px] font-black tracking-widest text-primary-600 border border-primary-600 rounded-lg px-3 py-1 uppercase">Change</button>
                            </div>
                        )}
                    </div>

                    {/* STEP 3: ORDER ARCHITECTURE & PAYMENT */}
                    <div className={`bg-white dark:bg-dark-card rounded-3xl border ${activeStep === 3 ? 'border-primary-500 shadow-2xl' : 'border-gray-100 dark:border-gray-800'} transition-all overflow-hidden`}>
                         <div className={`p-6 ${activeStep === 3 ? 'bg-primary-600' : 'bg-gray-50 dark:bg-dark-bg'} flex justify-between items-center transition-all`}>
                            <div className="flex items-center space-x-4">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${activeStep === 3 ? 'bg-white text-primary-600' : 'bg-gray-200 text-gray-500'}`}>3</span>
                                <h3 className={`font-black text-xs uppercase tracking-widest ${activeStep === 3 ? 'text-white' : 'text-gray-400'}`}>Order Summary & Payment</h3>
                            </div>
                        </div>
                        
                        <AnimatePresence>
                            {activeStep === 3 && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="p-8"
                                >
                                    <div className="space-y-6">
                                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {cartItems.map(item => (
                                                <div key={item.product} className="py-6 flex items-center space-x-6">
                                                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 p-1" />
                                                    <div className="flex-1">
                                                        <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest leading-relaxed line-clamp-1">{item.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Qty: {item.qty} units</p>
                                                        <p className="text-sm font-black text-primary-600 mt-2">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="bg-gray-50 dark:bg-dark-bg p-6 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Secured Payment Gateway</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-3 bg-white dark:bg-dark-card rounded-2xl shadow-sm text-primary-600"><CreditCard size={24} /></div>
                                                    <div>
                                                        <p className="font-black text-xs uppercase tracking-widest">Razorpay Hub</p>
                                                        <p className="text-[9px] font-bold text-gray-500">Encrypted 256-bit Connection</p>
                                                    </div>
                                                </div>
                                                <ShieldCheck className="text-green-500" />
                                            </div>
                                        </div>
                                        
                                        <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">An order confirmation email will be sent to {user.email}</p>
                                        
                                        <button 
                                            onClick={displayRazorpay} 
                                            disabled={loading}
                                            className="btn-primary w-full py-5 rounded-[2rem] text-xl font-black shadow-primary-500/40"
                                        >
                                            {loading ? <Clock className="animate-spin" /> : `CONFIRM PAYMENT OF ₹${totalPrice}`}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

                {/* Price Summary (Right) */}
                <div className="lg:w-1/3">
                    <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-10 sticky top-32 shadow-sm">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-10">Financial Summary</h2>
                        
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Retail total</span>
                                <span className="dark:text-white">₹{itemsPrice.toLocaleString('en-IN')}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between items-center text-xs font-black text-primary-600">
                                    <span className="uppercase tracking-widest">Asset Coupon</span>
                                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Fulfillment Fee</span>
                                <span className={shippingPrice === 0 ? 'text-green-500 uppercase tracking-widest' : 'dark:text-white'}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className="text-gray-500 uppercase tracking-widest">Platform Tax</span>
                                <span className="dark:text-white">₹{taxPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>

                        {/* Coupon Reveal */}
                        {!appliedCoupon ? (
                            <div className="mb-10 p-2 bg-gray-50 dark:bg-dark-bg rounded-2xl flex items-center space-x-2 border border-gray-100 dark:border-gray-800">
                                <input 
                                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-black tracking-widest p-4 uppercase" 
                                    placeholder="PROMO CODE" 
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                />
                                <button onClick={handleApplyCoupon} className="p-3 px-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-[10px] font-black tracking-widest uppercase">Apply</button>
                            </div>
                        ) : (
                            <div className="mb-10 p-5 rounded-2xl bg-primary-100/50 border border-primary-200 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <Ticket size={20} className="text-primary-600" />
                                    <span className="font-black text-xs text-primary-700">{appliedCoupon.code}</span>
                                </div>
                                <button onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); }} className="text-primary-700"><X size={16} /></button>
                            </div>
                        )}

                        <div className="pt-8 border-t-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mb-2">Total Amount Payable</p>
                            <p className="text-5xl font-black dark:text-white tracking-tighter">₹{Number(totalPrice).toLocaleString('en-IN')}</p>
                            {discountAmount > 0 && <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-50 px-4 py-2 rounded-xl">You saved ₹{discountAmount.toLocaleString('en-IN')}</p>}
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-3 text-gray-400">
                            <Lock size={14} />
                            <p className="text-[9px] font-black uppercase tracking-widest">Encrypted Data Protocol Active</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
