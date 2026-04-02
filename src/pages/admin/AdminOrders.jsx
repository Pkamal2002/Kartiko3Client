import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext';
import Spinner, { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    Package, 
    Truck, 
    Eye, 
    Download, 
    ChevronRight, 
    MoreVertical, 
    CheckCircle2, 
    Clock, 
    Calendar,
    X,
    Filter,
    ArrowRight,
    MapPin,
    Phone,
    User as UserIcon,
    FileText,
    TrendingUp,
    ShieldAlert,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOrderReceipt } from '../../utils/OrderReceipt';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/orders');
            setOrders(data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to orchestrate order data');
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = 'Command Center | Logistics | Kartiko';
        fetchOrders();
    }, [user]);

    const handleUpdateOrder = async (id, payload) => {
        try {
            const { data } = await api.put(`/api/orders/${id}/status`, payload);
            toast.success(`Fulfillment sequence updated`);
            if (selectedOrder?._id === id) setSelectedOrder(data);
            setOrders(orders.map(o => o._id === id ? data : o));
        } catch (error) {
            toast.error('System failure during update');
        }
    };

    const tabs = ['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    const statusSteps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    const filteredOrders = activeTab === 'All' 
        ? orders 
        : orders.filter(order => order.orderStatus === activeTab);

    const openOrderSidebar = (order) => {
        setSelectedOrder(order);
        setIsSidebarOpen(true);
    };

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
                        <TrendingUp className="mr-4 text-primary-600" /> Logistics Control
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Global fulfillment & supply chain oversight</p>
                </div>
                
                {/* Elite Tabs */}
                <div className="flex bg-white dark:bg-dark-card p-1.5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Data Grid */}
            <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-bg/50 border-b border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sequence ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Node</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Financials</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fulfillment</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <Package size={48} className="text-gray-300 mb-6" />
                                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Zero Activity Detected</h3>
                                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No orders matching the current filter</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-primary-600 dark:text-primary-400 font-mono">#{order._id.substring(18).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-dark-bg flex items-center justify-center text-primary-600 border border-gray-100 dark:border-gray-800">
                                                    <UserIcon size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900 dark:text-white mb-0.5">{order.user?.name || 'Guest'}</div>
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{order.shippingAddress.city}, {order.shippingAddress.state}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white mb-1">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Initiated</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-900 dark:text-white">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest ${
                                                order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                order.orderStatus === 'Out for Delivery' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => generateOrderReceipt(order)}
                                                    className="p-3 rounded-2xl bg-gray-50 dark:bg-dark-bg text-gray-400 hover:text-primary-600 transition-all border border-gray-100 dark:border-gray-800"
                                                    title="Export Invoice"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openOrderSidebar(order)}
                                                    className="btn-primary py-2.5 px-6 rounded-xl text-[10px] uppercase font-black shadow-xl shadow-primary-500/10"
                                                >
                                                    Manage
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

            {/* Elite Management Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && selectedOrder && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70]"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-dark-bg shadow-2xl z-[80] overflow-y-auto"
                        >
                            <div className="p-12">
                                <div className="flex items-center justify-between mb-16">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-14 h-14 rounded-[2rem] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-500/30">
                                            <Package size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">
                                                Fulfillment Center<span className="text-primary-600">.</span>
                                            </h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sequence Code: #{selectedOrder._id.substring(18).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-12">
                                    {/* Advanced Timeline Stepper */}
                                    <section>
                                        <div className="flex items-center space-x-3 text-primary-600 font-black uppercase tracking-widest text-xs mb-10">
                                            <Clock size={16} />
                                            <span>Orchestration Progress</span>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute left-[23px] top-0 h-full w-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
                                            <div className="space-y-12 relative">
                                                {statusSteps.map((s, idx) => {
                                                    const currentIndex = statusSteps.indexOf(selectedOrder.orderStatus);
                                                    const isCompleted = idx <= currentIndex;
                                                    const isCurrent = idx === currentIndex + 1;
                                                    
                                                    // If status is not in our steps (e.g. Cancelled), fallback to showing step 1
                                                    const showTransition = isCurrent || (currentIndex === -1 && idx === 0);

                                                    return (
                                                        <div key={s} className="flex items-start space-x-4">
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                                    {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                                </div>
                                                                {idx !== statusSteps.length - 1 && <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                                                            </div>
                                                            <div className="flex-1 pt-1 pb-4">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <p className={`text-sm font-black uppercase tracking-widest ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{s}</p>
                                                                    {isCompleted && <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Done</span>}
                                                                </div>
                                                                
                                                                {showTransition && (
                                                                    <button 
                                                                        onClick={() => handleUpdateOrder(selectedOrder._id, { status: s })}
                                                                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center space-x-2"
                                                                    >
                                                                        <Zap size={14} />
                                                                        <span>Execute Transition</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Logistics Scheduling */}
                                    <section className="bg-gray-50 dark:bg-dark-card/50 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="flex items-center space-x-4 mb-8">
                                            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 shadow-lg shadow-blue-500/10"><Calendar size={20} /></div>
                                            <h4 className="text-lg font-black uppercase tracking-tighter">Logistics Schedule</h4>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Estimated Arrival Protocol</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full bg-white dark:bg-dark-bg border-2 border-transparent focus:border-primary-500/20 rounded-2xl p-5 text-sm font-black outline-none transition-all dark:text-white shadow-sm"
                                                    value={selectedOrder.estimatedDeliveryDate ? selectedOrder.estimatedDeliveryDate.substring(0, 10) : ''}
                                                    onChange={(e) => handleUpdateOrder(selectedOrder._id, { estimatedDeliveryDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Action Command Center */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <button 
                                            onClick={() => generateOrderReceipt(selectedOrder)}
                                            className="p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl group"
                                        >
                                            <FileText size={32} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Generate Invoice</span>
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateOrder(selectedOrder._id, { status: 'Cancelled' })}
                                            className="p-8 bg-red-50 text-red-600 rounded-[3rem] flex flex-col items-center justify-center space-y-4 hover:scale-[1.02] active:scale-95 transition-all border border-red-100 group"
                                        >
                                            <ShieldAlert size={32} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-[12px] font-black uppercase tracking-[0.2em]">Void Sequence</span>
                                        </button>
                                    </div>
                                    
                                    {/* Logistics Data */}
                                    <div className="p-10 bg-white dark:bg-dark-card rounded-[3rem] border border-gray-100 dark:border-gray-800 space-y-8">
                                        <div className="flex items-start space-x-6">
                                            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl"><MapPin size={20} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Delivery Coordinate</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">
                                                    {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},<br />
                                                    {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-6">
                                            <div className="p-3 bg-gray-50 dark:bg-dark-bg rounded-2xl"><Phone size={20} className="text-gray-400" /></div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Communication Link</p>
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.shippingAddress.phone || 'System link offline'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminOrders;
